#!/usr/bin/env python3
"""Track SRV role handoffs on a daily price series.

The chain, in the words of the notes:

    A => alpha -> S -> R -> V -> omega => Omega

    alpha   near horizon, the first day the frame admits
    S       source, the price the frame starts from
    R       relation, the log change that takes the source to the value
    V       value, the price the frame realizes
    omega   far horizon, the last day the frame admits

A realized value becomes the source of the next frame when that frame
admits it. The notes write this as V becoming S. On this series each
session is a frame, so each close can be a value and then the next
source.

The 1989 check asks a narrower question. A log-line fitted through
1950-1989 leaves the later index about 3.7 times above it. The script
asks whether that gap is the handoff at the 1989 boundary, or a
displacement the handoff does not carry.

This is a reading of one series. It does not change the app.

Examples:

    python3 scripts/track_srv.py
    python3 scripts/track_srv.py --csv prices.csv
    python3 scripts/track_srv.py --full
    python3 scripts/track_srv.py --check
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import sys
import urllib.request
from datetime import date, datetime, timezone


YAHOO = (
    "https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC"
    "?period1={start}&period2={end}&interval=1d&events=history"
)
FIT_END = date(1989, 12, 31)
SERIES_START = date(1950, 1, 1)
SERIES_END = date(2026, 11, 30)


def fetch_yahoo(start: date, end: date) -> list[tuple[date, float]]:
    """Daily closes from Yahoo's chart endpoint. Missing prints are dropped."""
    start_stamp = int(datetime(start.year, start.month, start.day, tzinfo=timezone.utc).timestamp())
    end_stamp = int(datetime(end.year, end.month, end.day, tzinfo=timezone.utc).timestamp()) + 86400
    url = YAHOO.format(start=start_stamp, end=end_stamp)
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=60) as response:
        payload = json.load(response)
    result = payload["chart"]["result"][0]
    rows = []
    for stamp, close in zip(result["timestamp"], result["indicators"]["quote"][0]["close"]):
        if close is None:
            continue
        session = datetime.fromtimestamp(stamp, timezone.utc).date()
        if start <= session <= end and close > 0:
            rows.append((session, float(close)))
    rows.sort()
    return rows


def read_csv(path: str) -> list[tuple[date, float]]:
    rows = []
    with open(path, newline="") as handle:
        for record in csv.DictReader(handle):
            session = datetime.strptime(record["date"], "%Y-%m-%d").date()
            close = float(record["close"])
            if close > 0:
                rows.append((session, close))
    rows.sort()
    return rows


def session_frames(rows: list[tuple[date, float]]) -> list[dict]:
    """One frame per session after the first. The previous close is the source."""
    frames = []
    for index in range(1, len(rows)):
        previous_day, previous_close = rows[index - 1]
        day, close = rows[index]
        frames.append(
            {
                "alpha": day,
                "omega": day,
                "source_date": previous_day,
                "source": previous_close,
                "relation": math.log(close / previous_close),
                "value": close,
                "carries": True,
            }
        )
    return frames


def year_frames(rows: list[tuple[date, float]]) -> list[dict]:
    """The same handoff, read once per calendar year."""
    by_year: dict[int, list[tuple[date, float]]] = {}
    for day, close in rows:
        by_year.setdefault(day.year, []).append((day, close))
    frames = []
    previous = None
    for year in sorted(by_year):
        sessions = by_year[year]
        alpha, first = sessions[0]
        omega, last = sessions[-1]
        if previous is None:
            source_date, source = alpha, first
            carries = False
        else:
            source_date, source = previous
            carries = True
        frames.append(
            {
                "year": year,
                "alpha": alpha,
                "omega": omega,
                "source_date": source_date,
                "source": source,
                "relation": math.log(last / source),
                "value": last,
                "carries": carries,
            }
        )
        previous = (omega, last)
    return frames


def fit_log_line(rows: list[tuple[date, float]], fit_end: date) -> tuple[float, float, int]:
    """Ordinary line of log price on trading-day index, through fit_end."""
    sample = [(index, math.log(close)) for index, (day, close) in enumerate(rows) if day <= fit_end]
    if len(sample) < 2:
        raise ValueError("the fit window has fewer than two sessions")
    xs = [index for index, _ in sample]
    ys = [value for _, value in sample]
    mean_x = sum(xs) / len(xs)
    mean_y = sum(ys) / len(ys)
    spread = sum((x - mean_x) ** 2 for x in xs)
    slope = sum((x - mean_x) * (y - mean_y) for x, y in zip(xs, ys)) / spread
    intercept = mean_y - slope * mean_x
    return intercept, slope, sample[-1][0]


def line_price(intercept: float, slope: float, index: int) -> float:
    return math.exp(intercept + slope * index)


def boundary_frame(frames: list[dict], fit_end: date) -> dict | None:
    """The first session frame whose source is still inside the fit window."""
    for frame in frames:
        if frame["source_date"] <= fit_end < frame["omega"]:
            return frame
    return None


def report(rows: list[tuple[date, float]], full: bool) -> str:
    sessions = session_frames(rows)
    years = year_frames(rows)
    intercept, slope, fit_index = fit_log_line(rows, FIT_END)
    boundary = boundary_frame(sessions, FIT_END)
    if boundary is None:
        raise ValueError("no session crosses the 1989 fit window")

    end_index = len(rows) - 1
    end_day, end_close = rows[-1]
    end_ratio = end_close / line_price(intercept, slope, end_index)
    source_index = next(index for index, (day, _) in enumerate(rows) if day == boundary["source_date"])
    next_index = next(index for index, (day, _) in enumerate(rows) if day == boundary["omega"])
    source_ratio = boundary["source"] / line_price(intercept, slope, source_index)
    next_ratio = boundary["value"] / line_price(intercept, slope, next_index)
    handoff_ratio = boundary["value"] / boundary["source"]

    lines = [
        f"series  {rows[0][0].isoformat()} to {end_day.isoformat()}   {len(rows)} closes",
        "chain   alpha -> S -> R -> V -> omega, one frame per session",
        f"handoffs  {sum(frame['carries'] for frame in sessions)} session frames carry the previous close as source",
        "",
        "year handoffs  (each year's realized close becomes the next year's source)",
    ]
    for frame in years:
        mark = ""
        if frame["omega"].year == FIT_END.year:
            mark = "   <-- this close becomes the next source"
        carried = "carries" if frame["carries"] else "opens"
        lines.append(
            f"  {frame['year']}  alpha {frame['alpha'].isoformat()}"
            f"  S {frame['source']:.2f} ({frame['source_date'].isoformat()}, {carried})"
            f"  R {frame['relation']:+.3f}"
            f"  V {frame['value']:.2f}"
            f"  omega {frame['omega'].isoformat()}{mark}"
        )
    lines.extend(
        [
            "",
            "1989 boundary, session frame",
            f"  alpha {boundary['alpha'].isoformat()}",
            f"  S     {boundary['source']:.2f} on {boundary['source_date'].isoformat()}",
            f"  R     {boundary['relation']:+.4f}  ({handoff_ratio - 1:+.2%} across the handoff)",
            f"  V     {boundary['value']:.2f}",
            f"  omega {boundary['omega'].isoformat()}",
            f"  handoff  V on {boundary['source_date'].isoformat()} is S of {boundary['omega'].isoformat()}",
            "",
            f"1950-1989 log line, fit through session {fit_index} ({rows[fit_index][0].isoformat()})",
            f"  handed-off close / line on {boundary['source_date'].isoformat()}  {source_ratio:.2f}",
            f"  next close / line on {boundary['omega'].isoformat()}  {next_ratio:.2f}",
            f"  price / line on {end_day.isoformat()}  {end_ratio:.2f}",
            "",
            "verdict",
            "  " + verdict(boundary["carries"], handoff_ratio - 1, end_ratio, end_day),
        ]
    )
    if full:
        lines.extend(["", "session handoffs"])
        for frame in sessions:
            lines.append(
                f"  {frame['omega'].isoformat()}  S {frame['source']:.2f}"
                f"  R {frame['relation']:+.4f}  V {frame['value']:.2f}"
            )
    return "\n".join(lines)


def verdict(carries: bool, step: float, end_ratio: float, end_day: date) -> str:
    if not carries:
        return "The close on the 1989 side is not the source of the next frame. The boundary is not a role handoff."
    handed = (
        f"The boundary is a role handoff. The realized close becomes the next source, "
        f"and the step across it is {step:+.2%}."
    )
    if end_ratio < 1.25:
        return handed + " The end of the series is still near the 1950-1989 line."
    return (
        handed
        + f" On {end_day.isoformat()} the price is {end_ratio:.2f} times that line."
        + " That multiple is not the handoff."
        + " SRV framing accounts for the close being carried into the next frame."
        + " It does not account for the level shift off the frozen line."
    )


def check() -> str:
    """A four-point series: the third close must be the fourth frame's source."""
    rows = [
        (date(1989, 12, 28), 100.0),
        (date(1989, 12, 29), 110.0),
        (date(1990, 1, 2), 121.0),
        (date(1990, 1, 3), 100.0),
    ]
    frames = session_frames(rows)
    boundary = boundary_frame(frames, FIT_END)
    if boundary is None or boundary["source"] != 110.0 or boundary["value"] != 121.0:
        raise AssertionError("boundary handoff did not pass the 1989 close through")
    if frames[2]["source"] != frames[1]["value"]:
        raise AssertionError("a realized value did not become the next source")
    years = year_frames(rows)
    if years[1]["source"] != years[0]["value"]:
        raise AssertionError("the year handoff did not carry the prior close")
    return "check passed: a realized close becomes the next source, including across 1989"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--csv", help="date,close file instead of Yahoo")
    parser.add_argument("--full", action="store_true", help="also print every session handoff")
    parser.add_argument("--check", action="store_true", help="run the small handoff check and stop")
    args = parser.parse_args(argv)

    if args.check:
        print(check())
        return 0
    rows = read_csv(args.csv) if args.csv else fetch_yahoo(SERIES_START, SERIES_END)
    if len(rows) < 2:
        raise ValueError("need at least two closes")
    print(report(rows, args.full))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (ValueError, OSError, KeyError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        sys.exit(2)
