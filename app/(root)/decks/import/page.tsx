"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface PreviewCard {
  face?: string;
  kanji?: string;
  grammar?: string;
  meaning?: string;
  [key: string]: any;
}

interface PreviewDeck {
  deck_name: string;
  cards: PreviewCard[];
}

export default function ImportDeckPage() {
  // router
  const router = useRouter();

  // states
  const [previewData, setPreviewData] = useState<PreviewDeck | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage("");
    setSuccessMessage("");
    setPreviewData(null);

    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);

        // Basic structure validation
        if (!json.deck_name || !json.cards || !Array.isArray(json.cards)) {
          throw new Error(
            "Invalid format. Ensure JSON has 'deck_name' and a 'cards' array.",
          );
        }

        setPreviewData(json);
      } catch (error: any) {
        setErrorMessage(error.message || "Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const confirmUpload = async () => {
    if (!previewData) return;

    setIsUploading(true);
    setErrorMessage("");

    try {
      // adding private
      const payload = {
        ...previewData,
        isPublic: !isPrivate, // Se isPrivate for true, isPublic será false
      };

      const response = await fetch("/api/decks/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to import deck.");
      }

      setSuccessMessage("Deck imported successfully!");
      setPreviewData(null); // Clear the table

      // Optionally redirect after a short delay
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 2000);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import Deck</h1>
        <p className="text-muted-foreground mt-2">
          Upload your Anki JSON file to add new cards to your collection.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="max-w-sm"
        />
      </div>

      {previewData &&
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="private-deck" 
            checked={isPrivate} 
            onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
            disabled={isUploading}
          />
          <Label
            htmlFor="private-deck" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Manter este deck privado (visível apenas para mim)
          </Label>
        </div>
      }

      {errorMessage && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      {previewData && (
        <div className="space-y-4 border rounded-md p-4 bg-card">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Preview: {previewData.deck_name}
            </h2>
            <Button onClick={confirmUpload} disabled={isUploading} className="cursor-pointer">
              {isUploading ? "Importing..." : "Confirm & Import"}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Found {previewData.cards.length} cards.
          </p>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID / #</TableHead>
                  <TableHead>Front (Face/Kanji/Grammar)</TableHead>
                  <TableHead>Meaning</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.cards.slice(0, 10).map((card, index) => (
                  <TableRow key={card.id || index}>
                    <TableCell className="font-medium">
                      {card.id || index + 1}
                    </TableCell>
                    <TableCell>
                      {card.kanji || card.grammar || card.face || "N/A"}
                    </TableCell>
                    <TableCell className="truncate max-w-xs">
                      {card.meaning || card.back || "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {previewData.cards.length > 10 && (
              <div className="p-3 text-center text-sm text-muted-foreground bg-muted/50">
                Showing first 10 cards...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
