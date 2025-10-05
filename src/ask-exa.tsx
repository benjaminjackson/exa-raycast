import { useState, useEffect } from "react";
import {
  Detail,
  Toast,
  showToast,
  getPreferenceValues,
  ActionPanel,
  Action,
} from "@raycast/api";

interface Arguments {
  question: string;
}

interface Preferences {
  apiKey: string;
}

interface Citation {
  id: string;
  url: string;
  title: string;
  snippet?: string;
}

export default function Command(props: { arguments: Arguments }) {
  const { question } = props.arguments;
  const { apiKey } = getPreferenceValues<Preferences>();

  const [response, setResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [citations, setCitations] = useState<Citation[]>([]);

  useEffect(() => {
    async function fetchAnswer() {
      if (!question || !apiKey) {
        setError("Missing question or API key");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("https://api.exa.ai/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({
            model: "exa",
            messages: [
              {
                role: "system",
                content:
                  "Respond with a thorough analysis, including all of the relevant details from the sources.",
              },
              {
                role: "user",
                content: question,
              },
            ],
            stream: false,
            text: true,
            userLocation: "US",
          }),
        });

        if (!response.ok) {
          throw new Error(
            `API request failed: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();

        const content =
          data.choices?.[0]?.message?.content || "No response received";
        setResponse(content);

        if (data.citations && Array.isArray(data.citations)) {
          setCitations(data.citations);
        }

        showToast({
          style: Toast.Style.Success,
          title: "Answer received",
          message: `Found ${data.citations?.length || 0} sources`,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setError(errorMessage);

        showToast({
          style: Toast.Style.Failure,
          title: "Request failed",
          message: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnswer();
  }, [question, apiKey]);

  const actions = (
    <ActionPanel>
      <Action.CopyToClipboard
        title="Copy Response"
        content={response}
        shortcut={{ modifiers: ["cmd"], key: "c" }}
      />
      {citations.length > 0 && (
        <Action.CopyToClipboard
          title="Copy Citations"
          content={citations.map((c) => `[${c.title}](${c.url})`).join("\n")}
          shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
        />
      )}
    </ActionPanel>
  );

  if (error) {
    return (
      <Detail
        markdown={`## Error\n\n${error}\n\nPlease check your API key and try again.`}
        actions={actions}
      />
    );
  }

  return (
    <Detail
      isLoading={isLoading}
      markdown={response || "Searching for answer..."}
      actions={actions}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Question" text={question} />
          <Detail.Metadata.Label
            title="Status"
            text={isLoading ? "Loading..." : "Complete"}
          />
          {citations.length > 0 && (
            <>
              <Detail.Metadata.Separator />
              <Detail.Metadata.Label
                title="Sources"
                text={`${citations.length} citation(s)`}
              />
              {citations.slice(0, 5).map((citation, index) => (
                <Detail.Metadata.Link
                  key={citation.id}
                  title={`${index + 1}. ${citation.title}`}
                  target={citation.url}
                  text={citation.snippet || citation.url}
                />
              ))}
            </>
          )}
        </Detail.Metadata>
      }
    />
  );
}
