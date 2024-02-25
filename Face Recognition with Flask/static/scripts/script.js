const btn=document.querySelector("#rn-submit");
let rollNo;
btn.addEventListener("click", () => {
    rollNo=Number.parseInt(document.querySelector("#roll_no").innerText);
});

async function fetchTrackerData() {
    const response = await fetch(`/tracker?roll_no=${rollNo}`);
    const data = await response.json();

    // Access the 'attend' object properties
    const pValue = data.attend.p;
    const cValue = data.attend.c;
    const mValue = data.attend.m;
    const bValue = data.attend.b;

    // Display the values in the HTML
    const output = `<p>Physics: ${pValue}</p>
                     <p>Chemistry: ${cValue}</p>
                     <p>Maths: ${mValue}</p>
                     <p>Biology: ${bValue}</p>`;
    document.getElementById('data').innerHTML = output;
}

fetchTrackerData();