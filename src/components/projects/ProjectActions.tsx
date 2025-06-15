
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Edit, Trash2 } from "lucide-react"
import { useProjects, Project } from '@/hooks/useProjects'
import { useToast } from '@/hooks/use-toast'

interface ProjectActionsProps {
  project: Project
  onProjectUpdate?: () => void
}

export function ProjectActions({ project, onProjectUpdate }: ProjectActionsProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editedProject, setEditedProject] = useState({
    name: project.name,
    description: project.description || ''
  })
  const { updateProject, deleteProject } = useProjects()
  const { toast } = useToast()

  const handleEdit = async () => {
    if (isUpdating) return
    
    setIsUpdating(true)
    try {
      await updateProject(project.id, {
        name: editedProject.name,
        description: editedProject.description
      })
      setEditDialogOpen(false)
      onProjectUpdate?.()
    } catch (error) {
      // Error is already handled in updateProject hook
      console.error('Failed to update project:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (isDeleting) return
    
    setIsDeleting(true)
    try {
      await deleteProject(project.id)
      setDeleteDialogOpen(false)
      onProjectUpdate?.()
    } catch (error) {
      // Error is already handled in deleteProject hook
      console.error('Failed to delete project:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditDialogChange = (open: boolean) => {
    if (isUpdating) return // Prevent closing during update
    setEditDialogOpen(open)
    if (!open) {
      // Reset form when closing
      setEditedProject({
        name: project.name,
        description: project.description || ''
      })
    }
  }

  const handleDeleteDialogChange = (open: boolean) => {
    if (isDeleting) return // Prevent closing during deletion
    setDeleteDialogOpen(open)
  }

  return (
    <div className="flex gap-2">
      <Dialog open={editDialogOpen} onOpenChange={handleEditDialogChange}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={isUpdating || isDeleting}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Project Name</Label>
              <Input
                id="edit-name"
                value={editedProject.name}
                onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
                disabled={isUpdating}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editedProject.description}
                onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                disabled={isUpdating}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => handleEditDialogChange(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEdit}
              disabled={isUpdating || !editedProject.name.trim()}
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={handleDeleteDialogChange}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={isUpdating || isDeleting}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete "{project.name}"? This action cannot be undone.</p>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => handleDeleteDialogChange(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
