def get_recommendations(analysis: dict, attack_results: dict = None) -> list[dict]:
    """Generate personalized security recommendations based on analysis."""
    recs = []

    # Length recommendations
    if analysis["length"] < 8:
        recs.append({
            "priority": "high",
            "category": "Length",
            "title": "Password is too short",
            "description": "Your password has only {} characters. Use at least 12 characters for adequate security.".format(analysis["length"]),
        })
    elif analysis["length"] < 12:
        recs.append({
            "priority": "medium",
            "category": "Length",
            "title": "Increase password length",
            "description": "Your password has {} characters. Increasing to 14+ characters significantly improves security.".format(analysis["length"]),
        })

    # Charset recommendations
    if not analysis["has_uppercase"]:
        recs.append({
            "priority": "medium",
            "category": "Complexity",
            "title": "Add uppercase letters",
            "description": "Including uppercase letters (A-Z) increases the character set from {} to {}.".format(
                analysis["charset_size"], analysis["charset_size"] + 26
            ),
        })
    if not analysis["has_digits"]:
        recs.append({
            "priority": "medium",
            "category": "Complexity",
            "title": "Add numbers",
            "description": "Including digits (0-9) expands the character set and adds entropy.",
        })
    if not analysis["has_special"]:
        recs.append({
            "priority": "medium",
            "category": "Complexity",
            "title": "Add special characters",
            "description": "Special characters (!@#$%^&*) add 33 possible characters to the pool, significantly increasing brute force difficulty.",
        })

    # Pattern-based recommendations
    for pattern in analysis.get("common_patterns", []):
        if "Keyboard walk" in pattern:
            recs.append({
                "priority": "high",
                "category": "Patterns",
                "title": "Avoid keyboard patterns",
                "description": "Keyboard walks like 'qwerty' or 'asdf' are among the first patterns attackers try.",
            })
        elif "Sequential" in pattern:
            recs.append({
                "priority": "high",
                "category": "Patterns",
                "title": "Avoid sequential characters",
                "description": "Sequences like '123' or 'abc' are easily predictable and reduce effective entropy.",
            })
        elif "common" in pattern.lower():
            recs.append({
                "priority": "high",
                "category": "Dictionary",
                "title": "Password found in common password lists",
                "description": "Your password appears in lists of commonly used passwords. Attackers check these first.",
            })
        elif "Leet" in pattern:
            recs.append({
                "priority": "high",
                "category": "Patterns",
                "title": "Leet speak substitutions are not secure",
                "description": "Replacing 'a' with '@' or 'e' with '3' is a well-known pattern that attackers include in mutation rules.",
            })

    # Attack-based recommendations
    if attack_results:
        if attack_results.get("dictionary_found"):
            recs.append({
                "priority": "high",
                "category": "Dictionary",
                "title": "Password exists in breach databases",
                "description": "Your exact password was found in the RockYou breach dataset containing 14 million leaked passwords. Change it immediately.",
            })
        if attack_results.get("hybrid_found"):
            recs.append({
                "priority": "high",
                "category": "Dictionary",
                "title": "Password is a simple mutation of a common word",
                "description": "Attackers routinely apply common mutations (capitalize, append numbers, leet speak) to dictionary words.",
            })

    # General best practices
    if analysis["entropy"] < 50:
        recs.append({
            "priority": "medium",
            "category": "General",
            "title": "Use a passphrase",
            "description": "Consider using a passphrase of 4+ random words (e.g., 'correct-horse-battery-staple') for both strength and memorability.",
        })

    recs.append({
        "priority": "low",
        "category": "General",
        "title": "Enable multi-factor authentication",
        "description": "Even strong passwords can be compromised. MFA adds a critical second layer of security.",
    })

    return recs
