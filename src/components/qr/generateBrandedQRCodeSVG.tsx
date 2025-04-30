
import { QRCodeSVG } from "qrcode.react";
import ReactDOMServer from "react-dom/server";
import quillLogo from "@/assets/quill_icon.png"; // Adjust path if needed

export async function generateBrandedQRCodeSVG({
  url,
  bookTitle,
}: {
  url: string;
  bookTitle?: string;
}): Promise<string> {
  // Convert imported logo into base64 string
  const base64Logo = await fetch(quillLogo)
    .then(res => res.blob())
    .then(blob => new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    }));

  const svgMarkup = ReactDOMServer.renderToStaticMarkup(
    <svg
      width="600"
      height="800"
      viewBox="0 0 600 800"
      xmlns="http://www.w3.org/2000/svg"
      style={{background: "white"}} // Explicitly set background color for compatibility
    >
      <rect
        x="0"
        y="0"
        width="600"
        height="800"
        rx="48"
        fill="white"
        stroke="#CCCCCC"
        strokeWidth="2"
      />

      <g transform="translate(75, 75)">
        <QRCodeSVG
          value={url}
          size={450}
          level="H"
          includeMargin={false}
          fgColor="#000000"
          bgColor="#ffffff"
        />
        <circle cx="225" cy="225" r="55" fill="white" />
        <image
          href={base64Logo}
          x="180"
          y="180"
          width="80"
          height="80"
          preserveAspectRatio="xMidYMid meet"
        />
      </g>

      <text
        x="300"
        y="590"
        textAnchor="middle"
        fill="rgb(25, 54, 60)"
        fontSize="40"
        fontFamily="'Playfair', serif"
      >
        Love this book? Tip &
      </text>
      <text
        x="300"
        y="640"
        textAnchor="middle"
        fill="rgb(25, 54, 60)"
        fontSize="40"
        fontFamily="'Playfair', serif"
      >
        message the author
      </text>
      <text
        x="300"
        y="690"
        textAnchor="middle"
        fill="rgb(25, 54, 60)"
        fontSize="40"
        fontWeight="bold"
        fontFamily="'Playfair', serif"
      >
        with Quilltips!
      </text>
    </svg>
  );

  // Create a proper SVG blob with correct content type
  const blob = new Blob([svgMarkup], { type: "image/svg+xml" });
  return URL.createObjectURL(blob);
}
