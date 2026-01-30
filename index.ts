import { tool } from "@langchain/core/tools";
import { z } from "zod";

// This defines the tool that OpenClaw will use
export const githubSummaryTool = tool(
  async ({ username }) => {
    try {
      // In a real production skill, we would use octokit and an API key.
      // For this lightweight version, we fetch public events.
      const response = await fetch(`https://api.github.com/users/${username}/events/public`);
      
      if (!response.ok) {
        return `Error fetching GitHub data: ${response.statusText}`;
      }

      const data = await response.json();
      
      // Filter for PushEvents to count commits today
      const today = new Date().toISOString().split('T')[0];
      const todaysEvents = data.filter((event: any) => 
        event.created_at.startsWith(today) && event.type === 'PushEvent'
      );
      
      const commitCount = todaysEvents.reduce((acc: number, event: any) => 
        acc + (event.payload.commits ? event.payload.commits.length : 0), 0
      );

      return `GitHub Activity for ${username} today (${today}):
      - Total Commits: ${commitCount}
      - Recent Event: ${data[0]?.type || 'No recent activity'} at ${data[0]?.repo?.name || 'unknown repo'}`;
      
    } catch (error) {
      return `Failed to fetch GitHub stats: ${error}`;
    }
  },
  {
    name: "github_summary",
    description: "Fetches a summary of GitHub activity for a specific user to track daily progress.",
    schema: z.object({
      username: z.string().describe("The GitHub username to check"),
    }),
  }
);
