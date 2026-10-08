let qrScanner = null;


// ==========================================
// ENCRYPT MESSAGE
// ==========================================

async function encryptMessage() {

    const message =
        document.getElementById("message").value.trim();

    const password =
        document.getElementById("password").value;


    if (!message) {
        alert("Please enter a message.");
        return;
    }


    if (!password) {
        alert("Please enter a password.");
        return;
    }


    try {

        const response = await fetch("/encrypt", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message,
                password: password
            })

        });


        const data = await response.json();


        if (data.error) {

            alert(data.error);

            return;
        }


        document.getElementById("qrResult").innerHTML = `

            <h2>QR Code Generated ✅</h2>

            <p>
                This QR contains the encrypted message.
            </p>

            <img
                src="${data.qr}"
                width="280"
                alt="Encrypted QR Code">

            <br><br>

            <a
                href="${data.qr}"
                download="secure_message.png">

                Download QR Code

            </a>

        `;


        // Keep the generated encrypted payload available
        // for testing the complete encryption/decryption flow.

        console.log("QR generated successfully.");

    }


    catch (error) {

        console.error(error);

        alert("Encryption error: " + error);

    }

}


// ==========================================
// START CAMERA SCANNER
// ==========================================

async function startScanner() {

    document.getElementById("scanner").innerHTML = "";

    if (qrScanner) {

        try {
            await qrScanner.stop();
        }

        catch (error) {
            console.log(error);
        }

    }


    qrScanner = new Html5Qrcode("scanner");


    try {

        await qrScanner.start(

            {
                facingMode: "environment"
            },

            {
                fps: 10,
                qrbox: 250
            },


            async function(decodedText) {

                console.log("QR DATA:", decodedText);


                // Put scanned data into textarea

                document.getElementById("scannedData").value =
                    decodedText;


                // Stop camera

                try {

                    await qrScanner.stop();

                }

                catch (error) {

                    console.log(error);

                }


                document.getElementById("scanner").innerHTML = `

                    <div style="
                        padding:15px;
                        margin-top:15px;
                        background:#e8f5e9;
                        border-radius:8px;
                    ">

                        ✅ QR code scanned successfully!

                    </div>

                `;

            },


            function(errorMessage) {

                // Normal scanning errors are ignored.

            }

        );

    }


    catch (error) {

        console.error(error);

        alert(
            "Camera could not start. You can upload the QR image instead."
        );

    }

}


// ==========================================
// SCAN QR FROM IMAGE
// ==========================================

async function scanQRImage() {

    const fileInput =
        document.getElementById("qrFile");

    const file =
        fileInput.files[0];


    if (!file) {
        return;
    }


    const scanner =
        new Html5Qrcode("scanner");


    try {

        const decodedText =
            await scanner.scanFile(file, true);


        console.log("QR IMAGE DATA:", decodedText);


        document.getElementById("scannedData").value =
            decodedText;


        document.getElementById("scanner").innerHTML = `

            <div style="
                padding:15px;
                margin-top:15px;
                background:#e8f5e9;
                border-radius:8px;
            ">

                ✅ QR image scanned successfully!

            </div>

        `;

    }


    catch (error) {

        console.error(error);

        alert(
            "Could not read the QR image. Please select a clear QR image."
        );

    }


    finally {

        try {
            await scanner.clear();
        }

        catch (error) {
            console.log(error);
        }

    }

}


// ==========================================
// DECRYPT MESSAGE
// ==========================================

async function decryptMessage() {

    const encrypted =
        document.getElementById("scannedData")
        .value
        .trim();


    const password =
        document.getElementById("decryptPassword")
        .value;


    if (!encrypted) {

        alert(
            "Please scan the QR code or upload the QR image first."
        );

        return;
    }


    if (!password) {

        alert("Please enter the password.");

        return;
    }


    try {

        const response =
            await fetch("/decrypt", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    encrypted: encrypted,

                    password: password

                })

            });


        const data =
            await response.json();


        const result =
            document.getElementById("decryptedResult");


        if (data.error) {

            result.innerHTML = `

                <div style="
                    padding:20px;
                    margin-top:20px;
                    background:#ffebee;
                    color:#c62828;
                    border-radius:10px;
                ">

                    <h3>❌ Decryption Failed</h3>

                    <p>${data.error}</p>

                </div>

            `;

            return;
        }


        result.innerHTML = `

            <div style="
                padding:20px;
                margin-top:20px;
                background:#e8f5e9;
                border-radius:10px;
            ">

                <h2>🔓 Decrypted Message</h2>

                <p style="
                    font-size:20px;
                    font-weight:bold;
                ">
                    ${data.message}
                </p>

            </div>

        `;

    }


    catch (error) {

        console.error(error);

        alert(
            "Connection error. Make sure Flask is running."
        );

    }

}