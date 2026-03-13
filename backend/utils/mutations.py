# Mutation helpers for hybrid attacks

LEET_MAP = {"a": "@", "e": "3", "i": "1", "o": "0", "s": "$", "t": "7", "l": "1"}
COMMON_SUFFIXES = ["!", "!!", "?", "#", "@", "123", "1234", "!@#", "1", "12"]


def generate_mutations(word: str):
    """Yield password mutations for a given base word."""
    yield word
    yield word.capitalize()
    yield word.upper()

    # Append digits 0-99
    for i in range(100):
        yield word + str(i)
        yield word.capitalize() + str(i)

    # Append common suffixes
    for suffix in COMMON_SUFFIXES:
        yield word + suffix
        yield word.capitalize() + suffix

    # Leet speak
    leet = word
    for char, replacement in LEET_MAP.items():
        leet = leet.replace(char, replacement)
    if leet != word:
        yield leet
        yield leet.capitalize()
        # Leet + digits
        for i in range(10):
            yield leet + str(i)

    # Reversed
    yield word[::-1]
    yield word[::-1].capitalize()
