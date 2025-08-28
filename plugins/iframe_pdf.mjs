/* - check if PDF
*  - check for iframes
*  - generate QR code for iframe link
*  - replace node
*  QR codes will be saved in the image_folder. make sure this folder exists!
*/

// see (https://next.jupyterbook.org/plugins/directives-and-roles#create-a-transform)

// npm install qrcode
import QRCode from "qrcode";
import { writeFile } from "fs/promises";

const image_folder = "./images";

const iframeTransform = {
  name: "iframe-pdf",
  doc: "Replace iframes in PDF builds.",
  stage: "document",
  plugin: (opts, utils) => async (tree) => {
    
    // Detect if we are building a PDF
    const isPDF = process.argv.some(arg => arg.includes("pdf"));
    
    // Get all nodes for each page
    const rootChildren = tree.children[0]?.children || [];

    // print all nodes
    rootChildren.forEach((node, index) => {
        if(node.type == 'image') console.log(node)
    })

    if (isPDF) {
        for (const [index, node] of rootChildren.entries()) {
            if (node.type === "container" && node.children[0]?.type === "iframe") {
            const url = node.children[0]?.src || "No link found";

            try {
                // Generate QR code as a buffer (PNG format)
                const buffer = await QRCode.toBuffer(url, { type: "png" });

                // Save buffer to file
                const outputFile = `${image_folder}/qrcode_${index}.png`;
                await writeFile(outputFile, buffer);

                console.log(`[IFRAME] Generated QR code, saved to ${outputFile}`);

                // Replace node with an image
                node.type = "container";
                node.children = [
                {
                    type: "paragraph",
                    children: [
                    { type: "text", value: "scan qr code to go to video" }
                    ]
                },
                {
                    type: "image",
                    url: `images/qrcode_${index}.png`,  // make sure relative to book build
                    alt: "QR code",
                    title: "scan the QR code to open the link"
                }
                ];
            } catch (err) {
                console.log("[IFRAME] Error generating QR code:", err);
            }
            }
        }
    }

    
  },
};

const plugin = {
  name: "Iframe PDF Plugin",
  transforms: [iframeTransform],
};

export default plugin;