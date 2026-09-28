// =====================================================
// ESP32-CAM OCR
// app.js
// =====================================================

// Tesseract.js will be loaded by index.html

let ocrWorker = null;


// =====================================================
// GET HTML ELEMENTS
// =====================================================

const statusElement =
    document.getElementById("status");

const resultElement =
    document.getElementById("result");

const cameraImage =
    document.getElementById("cameraImage");

const captureButton =
    document.getElementById("captureButton");

const readButton =
    document.getElementById("readButton");


// =====================================================
// CONNECT CAMERA
// =====================================================

function connectCamera()
{
    let ip =
        document.getElementById("esp32IP").value.trim();


    if (ip === "")
    {
        statusElement.innerText =
            "Please enter ESP32-CAM IP address.";

        return;
    }


    ip = ip
        .replace("http://", "")
        .replace("https://", "")
        .replace("/", "");


    window.esp32IP =
        "http://" + ip;


    statusElement.innerText =
        "Connecting to ESP32-CAM...";


    cameraImage.src =
        window.esp32IP +
        "/capture?t=" +
        Date.now();


    cameraImage.onload =
        function()
        {
            statusElement.innerText =
                "ESP32-CAM connected";

            captureButton.disabled =
                false;

            readButton.disabled =
                false;
        };


    cameraImage.onerror =
        function()
        {
            statusElement.innerText =
                "Camera connection failed. Check IP address.";
        };
}


// =====================================================
// CAPTURE IMAGE
// =====================================================

function captureImage()
{
    if (!window.esp32IP)
    {
        statusElement.innerText =
            "Connect ESP32-CAM first.";

        return;
    }


    statusElement.innerText =
        "Capturing image...";


    resultElement.innerText =
        "Waiting for OCR...";


    cameraImage.src =
        window.esp32IP +
        "/capture?t=" +
        Date.now();


    cameraImage.onload =
        function()
        {
            statusElement.innerText =
                "Image captured";

            readButton.disabled =
                false;
        };


    cameraImage.onerror =
        function()
        {
            statusElement.innerText =
                "Camera capture failed.";
        };
}


// =====================================================
// LOAD OCR
// =====================================================

async function loadOCR()
{
    try
    {
        statusElement.innerText =
            "Loading OCR engine...";


        ocrWorker =
            await Tesseract.createWorker("eng");


        statusElement.innerText =
            "OCR ready";


        console.log(
            "Tesseract OCR ready"
        );
    }
    catch(error)
    {
        console.error(
            "OCR loading error:",
            error
        );


        statusElement.innerText =
            "OCR loading failed";


        resultElement.innerText =
            error.message ||
            error;
    }
}


// =====================================================
// READ TEXT
// =====================================================

async function readText()
{
    if (!ocrWorker)
    {
        statusElement.innerText =
            "OCR is not ready yet.";

        return;
    }


    if (
        !cameraImage.complete ||
        cameraImage.naturalWidth === 0
    )
    {
        statusElement.innerText =
            "Capture an image first.";

        return;
    }


    try
    {
        readButton.disabled =
            true;


        statusElement.innerText =
            "Reading letters...";


        resultElement.innerText =
            "Analyzing image...";


        const result =
            await ocrWorker.recognize(
                cameraImage
            );


        let text =
            result.data.text.trim();


        if (text.length > 0)
        {
            statusElement.innerText =
                "Text reading completed";


            resultElement.innerText =
                text;
        }
        else
        {
            statusElement.innerText =
                "OCR completed";


            resultElement.innerText =
                "No readable text found.";
        }
    }
    catch(error)
    {
        console.error(
            "OCR recognition error:",
            error
        );


        statusElement.innerText =
            "OCR recognition failed";


        resultElement.innerText =
            error.message ||
            error;
    }


    readButton.disabled =
        false;
}


// =====================================================
// START OCR WHEN PAGE LOADS
// =====================================================

window.addEventListener(
    "load",
    function()
    {
        loadOCR();
    }
);
