import { Router, Route } from "@solidjs/router";
import { createEffect } from "solid-js";

function OldPortal() {
  createEffect(() => {
    console.log("ppp");
    window.location.href = "https://old-jets.bamidelemoses.net.ng";
  });
  return <>Redirecting.. .</>;
}

export default OldPortal;
