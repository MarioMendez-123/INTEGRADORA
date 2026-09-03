const fs = require("fs");
const path = require("path");
const B = require("./build.js");
const { Document, Packer } = B;
const { coverSection, frontMatter, bodyHeader, bodyFooter, bodyPageProps } = require("./main.js");
const { introduccion, capitulo1 } = require("./ch_intro_1.js");
const { capitulo2 } = require("./ch_2.js");
const { capitulo3 } = require("./ch_3.js");
const { capitulo4, conclusiones, referencias } = require("./ch_4_end.js");

const bodySection = {
  properties: { ...bodyPageProps },
  headers: { default: bodyHeader },
  footers: { default: bodyFooter },
  children: [
    ...introduccion,
    ...capitulo1,
    ...capitulo2,
    ...capitulo3,
    ...capitulo4,
    ...conclusiones,
    ...referencias,
  ],
};

const doc = new Document({
  creator: "Aether — equipo integrador",
  title: "Informe de implementación industrial del proyecto integrador Aether",
  description: "Informe de estadías — proyecto integrador Aether",
  styles: {
    default: {
      document: {
        run: { font: "IBM Plex Sans", size: 22, color: "1F2328" },
      },
    },
  },
  sections: [coverSection, frontMatter, bodySection],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(path.join(__dirname, "AETHER_Informe_Integrador.docx"), buf);
  console.log("Written, bytes:", buf.length);
}).catch(e => {
  console.error("ERROR", e);
  process.exit(1);
});
