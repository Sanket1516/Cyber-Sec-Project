from flask import Blueprint, request, jsonify

analysis_bp = Blueprint("analysis", __name__)


@analysis_bp.route("/analyze", methods=["POST"])
def analyze():
    from services.analysis_service import analyze_password
    from services.cracktime_service import estimate_crack_time

    data = request.get_json(force=True)
    password = data.get("password", "")

    if not password or not isinstance(password, str) or len(password) > 128:
        return jsonify({"error": "Password is required and must be 1-128 characters"}), 400

    analysis = analyze_password(password)
    crack_time = estimate_crack_time(analysis["charset_size"], analysis["length"])

    return jsonify({
        "analysisId": None,  # No persistent storage needed for now
        "length": analysis["length"],
        "charset": {
            "uppercase": analysis["has_uppercase"],
            "lowercase": analysis["has_lowercase"],
            "digits": analysis["has_digits"],
            "special": analysis["has_special"],
        },
        "charsetSize": analysis["charset_size"],
        "entropy": analysis["entropy"],
        "strengthScore": analysis["strength_score"],
        "strengthLabel": analysis["strength_label"],
        "commonPatterns": analysis["common_patterns"],
        "suggestions": analysis["suggestions"],
        "crackTimeEstimates": crack_time["estimates"],
    })
