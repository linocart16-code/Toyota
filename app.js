const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");

const app = express();

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "templates"));

// Simple template engine that converts Flask/Jinja2 syntax to static HTML
const htmlEngine = (path, options, callback) => {
  fs.readFile(path, "utf8", (err, template) => {
    if (err) return callback(err, "");
    
    let processed = template;
    
    // Remove all Jinja2 control blocks {% %}
    processed = processed.replace(/\{%[\s\S]*?%}/g, '');
    
    // Replace {{ url_for('static', filename='xxx') }} with /static/xxx
    processed = processed.replace(
      /\{\{\s*url_for\s*\(\s*['"]static['"]\s*,\s*filename\s*=\s*['"]([^'"]+)['"]\s*\)\s*\}\}/g,
      "/static/$1"
    );
    processed = processed.replace(
      /\{\{\s*url_for\s*\(\s*['"]vehicle['"]\s*,\s*model\s*=\s*['"]([^'"]+)['"]\s*\)\s*\}\}/g,
      "/vehicle/$1"
    );
    
    // Simple {{ variable }} replacement (just remove the brackets)
    processed = processed.replace(/\{\{\s*([^}]+)\s*\}\}/g, "$1");
    
    callback(null, processed);
  });
};

app.engine("html", htmlEngine);
app.engine("ejs", htmlEngine);

// Serve static files from /static folder - correctly map to /static/ URL
app.use('/static', express.static(path.join(__dirname, "static"), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
  }
}));

// Middleware for form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Helper function to generate URLs (replaces Flask's url_for)
function urlFor(route, options = {}) {
  if (route === "static") {
    return "/static/" + options.filename;
  }
  if (route === "vehicle") {
    return "/vehicle/" + options.model;
  }
  return "/";
}

// Make url_for available to all templates
app.use((req, res, next) => {
  res.locals.url_for = urlFor;
  next();
});

const VEHICLE_IMAGES = {
  "Wigo": "wigoH.webp",
  "Vios": "viosh.webp",
  "ATIV": "ativh.webp",
  "Corolla Altis": "corollah.webp",
  "Camry": "camryh.webp",
  "Raize": "raizeh.webp",
  "Veloz": "velozh.webp",
  "Rush": "rushh.webp",
  "Corolla Cross": "corolla_crossh.webp",
  "Yaris Cross": "yaris_crossh.webp",
  "RAV4": "RAV4h.webp",
  "Fortuner": "fortunerh.webp",
  "Land Cruiser Prado": "land_cruiser_pradoh.webp",
  "bZ4X": "bZ4Xh.webp",
  "Avanza": "avanzah.webp",
  "Innova": "innovah.webp",
  "Zenix": "zenixh.webp",
  "Alphard": "alphardh.webp",
  "Hiace": "hiaceh.webp",
  "Coaster": "coasterh.webp",
  "Hilux": "hiluxh.webp",
  "Hilux Fleet": "hilux_fleeth.webp",
  "Tamaraw": "tamarawh.webp",
  "Lite Ace": "lite_aceh.webp"
};

// Home route
app.get("/", (req, res) => {
  res.render("index.ejs");
});

// Vehicle routes
app.get("/vehicle/ativ", (req, res) => {
  res.render("ativ.ejs");
});

app.get("/vehicle/wigo", (req, res) => {
  res.render("wigo.ejs");
});

app.get("/vehicles", (req, res) => {
  res.render("showroom.ejs");
});

app.get("/vehicle/:model", (req, res) => {
  const model = req.params.model;
  const filePath = path.join(__dirname, "templates", `${model}.ejs`);
  if (fs.existsSync(filePath)) {
    res.render(model + ".ejs");
  } else {
    res.status(404).send("Not Found");
  }
});

// Login route
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  res.redirect("/");
});

// Inquiry route
app.post("/inquire", async (req, res) => {
  const { fullname, email, phone, variant, message } = req.body;

  console.log("New inquiry received:", fullname, email, phone, variant, message);

  const senderEmail = "linocart17@gmail.com";
  const senderPassword = "uktg kpwp plog oxrd";
  const receiverEmail = "linocart17@gmail.com";

  const subject = `New Vehicle Inquiry - ${variant}`;
  const body = `
NEW CUSTOMER INQUIRY

Full Name: ${fullname}
Email: ${email}
Phone: ${phone}
Preferred Vehicle: ${variant}

Message:
${message}
  `;

  let attachments = [];
  const imageFilename = VEHICLE_IMAGES[variant];
  if (imageFilename) {
    const imagePath = path.join(__dirname, "static", imageFilename);
    if (fs.existsSync(imagePath)) {
      attachments.push({
        filename: imageFilename,
        path: imagePath
      });
      console.log(`Attached image: ${imagePath}`);
    }
  }

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: senderEmail,
      pass: senderPassword
    }
  });

  try {
    await transporter.sendMail({
      from: senderEmail,
      to: receiverEmail,
      subject,
      text: body,
      replyTo: email,
      attachments
    });
    console.log("Email sent successfully!");
    res.redirect("/vehicle/wigo");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Failed to send email.");
  }
});

// Request Quote route
app.post("/request-quote", async (req, res) => {
  const { qname, qemail, qphone, qvehicle, qbirthdate, qaddress, qincome, qmessage } = req.body;

  console.log("New quote request received:", qname, qemail, qphone, qvehicle);

  const senderEmail = "linocart17@gmail.com";
  const senderPassword = "uktg kpwp plog oxrd";
  const receiverEmail = "linocart17@gmail.com";

  const subject = `New Quote Request - ${qvehicle}`;
  const body = `
NEW QUOTE REQUEST

Full Name: ${qname}
Email: ${qemail}
Phone: ${qphone}
Vehicle of Interest: ${qvehicle}
Birthdate: ${qbirthdate}
Complete Address: ${qaddress}
Source of Income: ${qincome}

Message:
${qmessage}
  `;

  let attachments = [];
  const imageFilename = VEHICLE_IMAGES[qvehicle];
  if (imageFilename) {
    const imagePath = path.join(__dirname, "static", imageFilename);
    if (fs.existsSync(imagePath)) {
      attachments.push({
        filename: imageFilename,
        path: imagePath
      });
      console.log(`Attached image: ${imagePath}`);
    }
  }

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: senderEmail,
      pass: senderPassword
    }
  });

  try {
    await transporter.sendMail({
      from: senderEmail,
      to: receiverEmail,
      subject,
      text: body,
      replyTo: qemail,
      attachments
    });
    console.log("Quote email sent successfully!");
    res.redirect("/");
  } catch (error) {
    console.error("Error sending quote email:", error);
    res.status(500).send("Failed to send quote email.");
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
