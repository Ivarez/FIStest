document.addEventListener("DOMContentLoaded", () => {
    function escapeHtml(str) {
        if (!str) return "";
        return str.replace(/[&<>"']/g, function (m) {
            return ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            })[m];
        });
    }

    const summBtn = document.getElementById("order-summary-btn");
    const summContainer = document.getElementById("order-summary");
    const darkLayer = document.querySelector(".dark__layer");
    const cancelBtn = document.querySelector(".cancel");


    function openModal(){
        darkLayer.classList.add("active");
        summContainer.classList.add("open");
        document.body.style.overflow = "hidden";
    }
    
    function closeModal(){
        darkLayer.classList.remove("active");
        summContainer.classList.remove("open");
        document.body.style.overflow = "";
    }


    summBtn.addEventListener("click", openModal);
    darkLayer.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    document.addEventListener("keydown", (e) =>{
        if(e.key === "Escape"){
            closeModal();
        }
    })
})