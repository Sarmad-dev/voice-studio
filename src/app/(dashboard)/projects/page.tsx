import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { FileText } from "lucide-react";

// Mock data for demonstration
const mockProjects = [
  {
    id: "1",
    name: "Sci-fi Adventure",
    description: "A story about space exploration and alien discovery",
    status: "COMPLETED",
    duration: "3:45",
    updatedAt: "2023-04-01",
    voiceModel: "Narrator",
  },
  {
    id: "2",
    name: "Meditation Guide",
    description: "Guided meditation with calming background music",
    status: "DRAFT",
    duration: "8:20",
    updatedAt: "2023-03-28",
    voiceModel: "My Voice",
  },
  {
    id: "3",
    name: "Product Demo",
    description: "Voice over for new software product demonstration",
    status: "PROCESSING",
    duration: "2:15",
    updatedAt: "2023-03-25",
    voiceModel: "Character Voice",
  },
  {
    id: "4",
    name: "Children's Story",
    description: "Bedtime story with character voices and sound effects",
    status: "COMPLETED",
    duration: "5:30",
    updatedAt: "2023-03-22",
    voiceModel: "Character Voice",
  },
];

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Audio Projects</h1>
        <Button>
          <Icons.plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Name
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Voice Model
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Duration
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Status
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Last Updated
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {mockProjects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  <td className="p-4 align-middle">
                    <div>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {project.description}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-middle">{project.voiceModel}</td>
                  <td className="p-4 align-middle">{project.duration}</td>
                  <td className="p-4 align-middle">
                    <div
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        project.status === "COMPLETED"
                          ? "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300"
                          : project.status === "PROCESSING"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300"
                      }`}
                    >
                      {project.status}
                    </div>
                  </td>
                  <td className="p-4 align-middle">{project.updatedAt}</td>
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-2">
                      <Link href={`/projects/${project.id}`}>
                        <Button variant="outline" size="sm">
                          <Icons.edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </Link>
                      {project.status === "COMPLETED" && (
                        <Button variant="outline" size="sm">
                          <Icons.download className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Icons.trash className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create New Project Card */}
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Icons.music className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-4 font-medium">Create New Audio Project</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a voice model and create a new audio project from scratch or use an existing story
        </p>
        <div className="mt-6 flex gap-4">
          <Link href="/projects/new">
            <Button>
              <Icons.plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </Link>
          <Link href="/stories">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              From Story
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 