import { QRCodeSVG } from "qrcode.react";
import ReactDOMServer from "react-dom/server";
import quillLogo from "@/assets/quill_icon.png";
import { fontBase64 } from "@/fonts/playfairFontBase64";

export async function generateBrandedQRCodeSVG({
  url,
  bookTitle,
}: {
  url: string;
  bookTitle?: string;
}): Promise<string> {
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
    >
      <style>
        {`
          @font-face {
            font-family: 'Playfair Embedded';
            src: url(data:font/ttf;base64,${fontBase64}) format('truetype');
          }
          .playfair {
            font-family: 'Playfair Embedded', Georgia, 'Times New Roman', serif;
            fill: black;
        `}
      </style>

      {/* Card background */}
      <rect
        x="0"
        y="0"
        width="600"
        height="790"
        rx="48"
        fill="white"
        stroke="#CCCCCC"
        strokeWidth="2"
      />

      {/* QR Code (450x450) */}
      <g transform="translate(75, 75)">
        <QRCodeSVG
          value={url}
          size={450}
          level="H"
          includeMargin={false}
          fgColor="#000000"
          bgColor="#ffffff"
        />
        {/* White circle behind logo */}
        <circle cx="225" cy="225" r="55" fill="white" />
        {/* Logo image */}
        <image
          href={base64Logo}
          x="180"
          y="180"
          width="80"
          height="80"
          preserveAspectRatio="xMidYMid meet"
        />
      </g>

      {/* Branded text using embedded + fallback fonts */}
      <text
        x="300"
        y="600"
        textAnchor="middle"
        fontSize="40"
        className="playfair"
      >
        Love this book? Tip &
      </text>
      <text
        x="300"
        y="655"
        textAnchor="middle"
        fontSize="40"
        className="playfair"
      >
        message the author
      </text>
      <text
        x="300"
        y="710"
        textAnchor="middle"
        fontSize="40"
        fontWeight="bold"
        className="playfair"
      >
        with Quilltips!
      </text>
    </svg>
  );

  const blob = new Blob([svgMarkup], { type: "image/svg+xml" });
  return URL.createObjectURL(blob);
}
