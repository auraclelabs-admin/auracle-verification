function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

async function loadData() {
    const response = await fetch("data/certificates.json");
    return response.json();
}

async function verifyCert(prefilledId) {
    const resultBox = document.getElementById("result");
    const input = document.getElementById("certInput");

    const id = (prefilledId || input.value).trim();

    if (!id) {
        resultBox.innerHTML = "<p class='error'>Please enter a Certificate ID.</p>";
        return;
    }

    try {
        const data = await loadData();
        const cert = data.certificates.find(
            c => c.id.toLowerCase() === id.toLowerCase()
        );

        if (cert) {
            // Build optional division/region lines
            let divisionLine = "";
            if (cert.family || cert.subdivision) {
                const fam = cert.family || "-";
                const sub = cert.subdivision ? ` / ${cert.subdivision}` : "";
                divisionLine = `<p><strong>Division:</strong> ${fam}${sub}</p>`;
            }

            let regionLine = "";
            if (cert.country || cert.zone_code || cert.zone_label) {
                const country = cert.country || "";
                const zoneLabel = cert.zone_label || "";
                const zoneCode = cert.zone_code || "";
                let regionText = country;
                if (zoneLabel) {
                    regionText += regionText ? ` – ${zoneLabel}` : zoneLabel;
                } else if (zoneCode) {
                    regionText += regionText ? ` (${zoneCode})` : zoneCode;
                }
                if (regionText) {
                    regionLine = `<p><strong>Region:</strong> ${regionText}</p>`;
                }
            }

            resultBox.innerHTML = `
                <div class='card'>
                    <h3>Certificate Found ✔️</h3>
                    <p><strong>Certificate ID:</strong> ${cert.id}</p>
                    <p><strong>Name:</strong> ${cert.name}</p>
                    ${cert.role ? `<p><strong>Role:</strong> ${cert.role}</p>` : ""}
                    ${divisionLine}
                    ${regionLine}
                    <p><strong>Period:</strong> ${cert.start_date} to ${cert.end_date}</p>
                    <p><strong>Status:</strong> ${cert.status}</p>
                    <p><strong>Issued By:</strong> ${cert.issued_by}</p>
                    <p><strong>Verified On:</strong> ${cert.verified_on}</p>
                </div>
            `;
            input.value = cert.id;
        } else {
            resultBox.innerHTML = "<p class='error'>❌ Certificate ID not found or invalid.</p>";
        }

    } catch (error) {
        console.error(error);
        resultBox.innerHTML = "<p class='error'>Server Error. Cannot load certificate database.</p>";
    }
}

// Auto-run when page loads
window.addEventListener("DOMContentLoaded", async () => {
    const fromUrl = getQueryParam("id") || getQueryParam("cert");
    if (fromUrl) {
        document.getElementById("certInput").value = fromUrl;
        verifyCert(fromUrl);
    }
});
