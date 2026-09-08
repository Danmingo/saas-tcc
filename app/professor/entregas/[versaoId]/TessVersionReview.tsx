"use client";

import { useState } from "react";
import DevolutivaForm from "../DevolutivaForm";
import TessVersionActions from "./TessVersionActions";

export default function TessVersionReview({ versaoId }: { versaoId: string }) {
  const [rascunho, setRascunho] = useState("");
  return <><TessVersionActions versaoId={versaoId} onDraft={setRascunho} /><DevolutivaForm key={rascunho || "devolutiva-vazia"} versaoId={versaoId} valorInicial={rascunho} /></>;
}