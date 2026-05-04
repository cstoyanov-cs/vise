

from dataclasses import dataclass


@dataclass()
class NetworkRule:
    domain : str | None
    is_whitelist:bool
    is_third_party: bool
    raw: str

@dataclass()
class CosmeticRule:
    selector: str | None
    domain: str | None
    is_whitelist: bool
    raw: str

def parse_line(line: str) -> NetworkRule | CosmeticRule | None:
    line = line.strip()
