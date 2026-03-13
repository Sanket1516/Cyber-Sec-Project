from flask import Blueprint, request, jsonify

cracktime_bp = Blueprint("cracktime", __name__)


@cracktime_bp.route("/crack-time", methods=["POST"])
def crack_time():
    from services.cracktime_service import estimate_crack_time

    data = request.get_json(force=True)
    charset_size = data.get("charsetSize")
    length = data.get("length")

    if not charset_size or not length:
        return jsonify({"error": "charsetSize and length are required"}), 400

    result = estimate_crack_time(int(charset_size), int(length))

    # Comparison benchmarks
    from services.cracktime_service import estimate_crack_time as est
    benchmarks = [
        {"label": "4-digit PIN", **est(10, 4)},
        {"label": "6-char lowercase", **est(26, 6)},
        {"label": "8-char mixed case", **est(52, 8)},
        {"label": "8-char full charset", **est(95, 8)},
        {"label": "12-char full charset", **est(95, 12)},
        {"label": "Your password", **est(int(charset_size), int(length))},
    ]

    return jsonify({
        "charsetSize": charset_size,
        "length": length,
        "totalCombinations": result["total_combinations"],
        "estimates": result["estimates"],
        "comparisonBenchmarks": [
            {
                "label": b["label"],
                "cpuSeconds": b["estimates"]["cpu"]["seconds"],
                "gpuSeconds": b["estimates"]["gpu"]["seconds"],
                "clusterSeconds": b["estimates"]["cluster"]["seconds"],
                "cpuDisplay": b["estimates"]["cpu"]["display"],
                "gpuDisplay": b["estimates"]["gpu"]["display"],
                "clusterDisplay": b["estimates"]["cluster"]["display"],
            }
            for b in benchmarks
        ],
    })
