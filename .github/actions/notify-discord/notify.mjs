import { readFile } from "node:fs/promises";

const webhook = process.env.CUBYT_DISCORD_WEBHOOK;
if (!webhook) {
  console.warn(
    "Discord deployment notification skipped: webhook secret is not configured.",
  );
  process.exit(0);
}

const webhookUrl = new URL(webhook);
if (
  webhookUrl.protocol !== "https:" ||
  webhookUrl.hostname !== "discord.com" ||
  !/^\/api\/webhooks\/\d+\/[A-Za-z0-9_.-]+$/.test(webhookUrl.pathname)
) {
  throw new Error(
    "The configured notification URL is not a valid Discord webhook endpoint.",
  );
}

const buildStatus = process.env.CUBYT_BUILD_STATUS ?? "unknown";
const deployStatus = process.env.CUBYT_DEPLOY_STATUS ?? "not-configured";
const succeeded =
  buildStatus === "success" &&
  ["success", "not-configured"].includes(deployStatus);
const failed = buildStatus === "failure" || deployStatus === "failure";
const status = failed ? "FAILED" : succeeded ? "SUCCEEDED" : "INCOMPLETE";
const color = failed ? 0xed4245 : succeeded ? 0x57ad86 : 0xfee75c;
const repository = process.env.GITHUB_REPOSITORY ?? "unknown repository";
const runUrl = `${process.env.GITHUB_SERVER_URL ?? "https://github.com"}/${repository}/actions/runs/${process.env.GITHUB_RUN_ID ?? ""}`;
let metadata;

try {
  metadata = JSON.parse(
    await readFile(
      process.env.CUBYT_METADATA_PATH ?? "dist/build-info.json",
      "utf8",
    ),
  );
} catch {
  metadata = undefined;
}

const fields = [
  { name: "App", value: process.env.CUBYT_APP ?? "Cubyt", inline: true },
  {
    name: "Environment",
    value: process.env.CUBYT_ENVIRONMENT ?? "unknown",
    inline: true,
  },
  { name: "Build", value: buildStatus, inline: true },
  { name: "Deploy", value: deployStatus, inline: true },
];

if (metadata?.version) {
  fields.push({ name: "Version", value: metadata.version, inline: true });
}
if (metadata?.buildId) {
  fields.push({ name: "Build ID", value: metadata.buildId, inline: true });
}
if (process.env.CUBYT_DEPLOYMENT_URL) {
  fields.push({
    name: "Site",
    value: process.env.CUBYT_DEPLOYMENT_URL,
    inline: false,
  });
}

const response = await fetch(webhookUrl, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    allowed_mentions: { parse: [] },
    embeds: [
      {
        title: `Cubyt · ${status}`,
        description: `Workflow [${process.env.GITHUB_WORKFLOW ?? "GitHub Actions"}](${runUrl}) · ${repository}`,
        color,
        fields,
        timestamp: new Date().toISOString(),
      },
    ],
  }),
});

if (!response.ok) {
  console.error(
    `Discord deployment notification failed with HTTP ${response.status}.`,
  );
  process.exitCode = 1;
}
