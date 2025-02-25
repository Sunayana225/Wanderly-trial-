document.addEventListener("DOMContentLoaded", function () {
    let currentStep = 1;
    const totalSteps = 5;
    let selectedPreferences = [];

    function showStep(step) {
        document.querySelectorAll(".step").forEach(s => s.style.display = "none");
        document.getElementById(`step${step}`).style.display = "block";
    }

    window.nextStep = function () {
        if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
        }
    };

    window.prevStep = function () {
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
        }
    };

    // Handle preference button clicks
    document.querySelectorAll(".preference-btn").forEach(button => {
        button.addEventListener("click", function () {
            const value = this.getAttribute("data-value");
            if (selectedPreferences.includes(value)) {
                // Deselect if already selected
                selectedPreferences = selectedPreferences.filter(item => item !== value);
                this.classList.remove("selected");
            } else {
                // Select if not already selected
                selectedPreferences.push(value);
                this.classList.add("selected");
            }
        });
    });

    document.getElementById("generateBtn").addEventListener("click", function () {
        let destination = document.getElementById("destination").value;
        let budget = document.getElementById("budget").value;
        let duration = document.getElementById("duration").value;
        let purpose = document.getElementById("purpose").value;

        document.getElementById("itinerary-content").innerHTML = "<p>Generating itinerary...</p>";
        document.getElementById("itinerary").style.display = "block";

        fetch("/generate-itinerary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ destination, budget, duration, purpose, preferences: selectedPreferences })
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById("itinerary-content").innerHTML = data.itinerary;
        })
        .catch(error => {
            document.getElementById("itinerary-content").innerHTML = "<p>Error fetching itinerary.</p>";
        });
    });

    // Share Itinerary
    document.getElementById("shareBtn").addEventListener("click", function () {
        const itineraryContent = document.getElementById("itinerary-content").innerText;
        const blob = new Blob([itineraryContent], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "itinerary.txt";
        a.click();
        URL.revokeObjectURL(url);
    });

    // Show the first step initially
    showStep(currentStep);
});