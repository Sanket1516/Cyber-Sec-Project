from flask import Blueprint, request, jsonify

recommendation_bp = Blueprint("recommendation", __name__)


@recommendation_bp.route("/recommendations", methods=["POST"])
def recommendations():
    from services.analysis_service import analyze_password
    from services.recommendation_service import get_recommendations

    data = request.get_json(force=True)
    password = data.get("password", "")
    attack_results = data.get("attackResults")

    if not password:
        return jsonify({"error": "password is required"}), 400

    analysis = analyze_password(password)
    recs = get_recommendations(analysis, attack_results)

    return jsonify({"recommendations": recs})
