
import { useState } from 'react'
import { Material } from '@/lib/supabase'

export interface DuplicateMaterial extends Material {
  similarity: number
}

export function useDuplicateDetection() {
  const [duplicates, setDuplicates] = useState<DuplicateMaterial[]>([])

  const findDuplicates = (
    newMaterial: {
      name: string
      type: string
      specific_material?: string
      origin?: string
      dimensions?: string
    },
    existingMaterials: Material[]
  ): DuplicateMaterial[] => {
    const found: DuplicateMaterial[] = []

    existingMaterials.forEach(existing => {
      let similarity = 0
      let matches = 0
      let total = 0

      // Check name similarity (most important)
      total++
      if (existing.name.toLowerCase() === newMaterial.name.toLowerCase()) {
        similarity += 40
        matches++
      } else if (existing.name.toLowerCase().includes(newMaterial.name.toLowerCase()) ||
                 newMaterial.name.toLowerCase().includes(existing.name.toLowerCase())) {
        similarity += 20
      }

      // Check type match (very important)
      total++
      if (existing.type === newMaterial.type) {
        similarity += 30
        matches++
      }

      // Check specific material match
      if (newMaterial.specific_material && existing.specific_material) {
        total++
        if (existing.specific_material.toLowerCase() === newMaterial.specific_material.toLowerCase()) {
          similarity += 20
          matches++
        }
      }

      // Check origin match
      if (newMaterial.origin && existing.origin) {
        total++
        if (existing.origin.toLowerCase() === newMaterial.origin.toLowerCase()) {
          similarity += 10
          matches++
        }
      }

      // Consider it a potential duplicate if similarity is 60% or higher
      if (similarity >= 60) {
        found.push({
          ...existing,
          similarity: Math.round(similarity)
        })
      }
    })

    // Sort by similarity (highest first)
    found.sort((a, b) => b.similarity - a.similarity)
    
    setDuplicates(found)
    return found
  }

  const clearDuplicates = () => {
    setDuplicates([])
  }

  return {
    duplicates,
    findDuplicates,
    clearDuplicates
  }
}
