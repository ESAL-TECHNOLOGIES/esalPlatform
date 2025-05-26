import React from "react";
import { Button } from "./components/Button";
import "./App.css";

// This component allows switching between light and dark mode images
interface ThemeImageProps {
  srcLight: string;
  srcDark: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

const ThemeImage = ({
  srcLight,
  srcDark,
  alt,
  width,
  height,
  className = "",
}: ThemeImageProps) => {
  return (
    <>
      <img
        src={`/${srcLight}`}
        alt={alt}
        width={width}
        height={height}
        className={`imgLight ${className}`}
      />
      <img
        src={`/${srcDark}`}
        alt={alt}
        width={width}
        height={height}
        className={`imgDark ${className}`}
      />
    </>
  );
};

function App() {
  return (
    <div className="page">
      <main className="main">
        <ThemeImage
          className="logo"
          srcLight="turborepo-dark.svg"
          srcDark="turborepo-light.svg"
          alt="Turborepo logo"
          width={180}
          height={38}
        />
        <ol>
          <li>
            Get started by editing <code>apps/docs/src/App.tsx</code>
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className="ctas">
          <a
            className="primary"
            href="https://turbo.build/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="vercelLogo"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={24}
              height={24}
            />
            Turborepo Docs
          </a>
          <a
            className="secondary"
            href="https://github.com/vercel/turborepo"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>

        <div className="links">
          <a href="https://turbo.build/repo/docs">
            <div className="resource">
              <Button>Read the docs</Button>
            </div>
          </a>

          <a href="https://turbo.build/discord">
            <div className="resource">
              <Button variant="secondary">Join Discord</Button>
            </div>
          </a>
        </div>
      </main>
    </div>
  );
}

export default App;
