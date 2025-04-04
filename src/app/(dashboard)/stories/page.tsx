import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { FileText } from "lucide-react";
import CreateProjectFromStory from "@/components/stories/create-project-from-story";

// Mock data for demonstration
const mockStories = [
  {
    id: "1",
    title: "The Last Starship",
    genre: "Science Fiction",
    prompt: "A sci-fi story about the last remaining humans searching for a new home",
    createdAt: "2023-04-05",
    wordCount: 1250,
  },
  {
    id: "2",
    title: "Whispers in the Woods",
    genre: "Horror",
    prompt: "A camping trip goes wrong when strange noises are heard in the forest",
    createdAt: "2023-03-28",
    wordCount: 980,
  },
  {
    id: "3",
    title: "The Lost Kingdom",
    genre: "Fantasy",
    prompt: "An ancient kingdom is discovered beneath a modern city",
    createdAt: "2023-03-15",
    wordCount: 1750,
  },
  {
    id: "4",
    title: "Morning Meditation",
    genre: "Relaxation",
    prompt: "A calming meditation script for morning routines",
    createdAt: "2023-03-10",
    wordCount: 650,
  },
];

export default function StoriesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Stories</h1>
        <Button>
          <Icons.plus className="mr-2 h-4 w-4" />
          Generate New Story
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {mockStories.map((story) => (
          <div
            key={story.id}
            className="flex flex-col justify-between rounded-lg border bg-card shadow-sm transition-colors hover:bg-accent/10"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                  {story.genre}
                </div>
                <div className="text-xs text-muted-foreground">
                  {story.wordCount} words
                </div>
              </div>
              <h3 className="mt-4 font-semibold">{story.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {story.prompt}
              </p>
              <div className="mt-4 text-xs text-muted-foreground">
                Created {story.createdAt}
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 border-t p-4">
              <Link href={`/stories/${story.id}`} className="w-full">
                <Button variant="outline" size="sm" className="w-full">
                  <Icons.edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <div className="w-full">
                <CreateProjectFromStory 
                  storyId={story.id} 
                  storyTitle={story.title}
                  buttonProps={{
                    buttonSize: "sm",
                    fullWidth: true
                  }}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Create New Story Card */}
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mt-4 font-medium">Generate New Story</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Use AI to create a custom story in any genre
          </p>
          <Button className="mt-6">
            <Icons.plus className="mr-2 h-4 w-4" />
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
} 