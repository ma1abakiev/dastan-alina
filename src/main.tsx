import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "framer-motion";
import InvitationTemplate from "./invitation/InvitationTemplate";
import { weddingData, galleryPhotos, featuredPhotos } from "./data";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <InvitationTemplate data={weddingData} photos={galleryPhotos} featured={featuredPhotos} />
    </MotionConfig>
  </StrictMode>,
);
