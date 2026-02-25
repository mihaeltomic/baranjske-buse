import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Baranjske buše — Masked ritual of Croatian Baranja";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const fontPath = join(process.cwd(), "src/app/fonts/NAMU-1910.ttf");
  const fontData = await readFile(fontPath);

  // Read logo SVG, recolor to gold, and encode as data URI
  const logoSvg = await readFile(join(process.cwd(), "public/logo-icon.svg"), "utf-8");
  const goldSvg = logoSvg.replace(/var\(--fill-0,\s*white\)/g, "rgba(201,168,76,0.9)");
  const logoDataUri = `data:image/svg+xml;base64,${Buffer.from(goldSvg).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          fontFamily: "NAMU",
          position: "relative",
        }}
      >
        {/* Subtle radial glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(60,35,10,0.5) 0%, transparent 70%)",
          }}
        />

        {/* Mask icon — loaded from logo-icon.svg, recolored to gold */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoDataUri}
          alt=""
          width={100}
          height={128}
          style={{ marginBottom: 36, opacity: 0.85 }}
        />

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            color: "rgba(201,168,76,0.9)",
            letterSpacing: "0.06em",
            textAlign: "center",
            lineHeight: 1.1,
            display: "flex",
          }}
        >
          Baranjske buše
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            marginTop: 20,
            display: "flex",
          }}
        >
          The masked rite of Croatian Baranja
        </div>

        {/* Bottom rule */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 40,
              height: 1,
              background: "rgba(201,168,76,0.3)",
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: 11,
              color: "rgba(201,168,76,0.3)",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            Est. Antiquity
          </div>
          <div
            style={{
              width: 40,
              height: 1,
              background: "rgba(201,168,76,0.3)",
              display: "flex",
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "NAMU",
          data: fontData,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}
