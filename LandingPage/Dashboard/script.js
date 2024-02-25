let btn1=document.querySelector(".btn1");
let status1=document.querySelector(".btn11");
let btn2=document.querySelector(".btn2");
let status2=document.querySelector(".btn22");
let btn3=document.querySelector(".btn3");
let status3=document.querySelector(".btn33");
let btn4=document.querySelector(".btn4");
let status4=document.querySelector(".btn44");
let btn5=document.querySelector(".btn5");
let status5=document.querySelector(".btn55");

let total=document.querySelector(".total");
let inProgress=document.querySelector(".in-progress");
let finished=document.querySelector(".finished");
let pending=document.querySelector(".pending");

c1=Number.parseInt(total.innerText);
c2=Number.parseInt(inProgress.innerText);
c3=Number.parseInt(finished.innerText);
c4=Number.parseInt(pending.innerText);

btn1.addEventListener("click", () => {
    startProj(status1, btn1);
});

btn2.addEventListener("click", () => {
    startProj(status2, btn2);
});

btn3.addEventListener("click", () => {
    startProj(status3, btn3);
});

btn4.addEventListener("click", () => {
    startProj(status4, btn4);
});

btn5.addEventListener("click", () => {
    startProj(status5, btn5);
});

function startProj(status, btn) {
    if(status.innerText==="Pending")
    {
        status.innerText="In Progress";
        status.setAttribute("class", "label btn-shape bg-blue c-white");
        btn.innerText="Submit";
        c4--;
        c2++;
        pending.innerText=c4;
        inProgress.innerText=c2;
    }
    else
    {
        status.innerText="Completed";
        status.setAttribute("class", "label btn-shape bg-green c-white");
        btn.innerText="Submitted!";
        c2--;
        c3++;
        inProgress.innerText=c2;
        finished.innerText=c3;
    }
}


