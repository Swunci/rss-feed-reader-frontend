import { endpoints } from '@/api/endpoints'
import { useDelete } from '@/composables/api/useDelete'
import { useFetch } from '@/composables/api/useFetch'
import { usePatch } from '@/composables/api/usePatch'
import { usePost } from '@/composables/api/usePost'
import type { Collection } from '@/types/collection'
import { ref } from 'vue'

const activeCollection = ref<Collection | null>(null)

const expandedCollections = ref<Set<number>>(new Set())

const {
  data: collections,
  loading: collectionsLoading,
  error: collectionsError,
  fetchData: fetchCollections,
} = useFetch<Collection[]>()

const {
  loading: loadingPostCollection,
  error: PostCollectionError,
  postData: postCollection,
} = usePost<Collection>()
const {
  loading: loadingPatchCollection,
  error: patchCollectionError,
  patchData: patchCollection,
} = usePatch()
const {
  loading: loadingDeleteCollection,
  error: deleteCollectionError,
  deleteData: deleteCollection,
} = useDelete()

const toggleCollection = (collection_id: number) => {
  expandedCollections.value.has(collection_id)
    ? expandedCollections.value.delete(collection_id)
    : expandedCollections.value.add(collection_id)
}

const addCollection = async (name: string) => {
  const success = await postCollection(endpoints.collections.create, { name: name })
  if (success) {
    await fetchCollections(endpoints.collections.getAll)
  }
  return success
}

const removeCollection = async (collectionId: number) => {
  const success = await deleteCollection(endpoints.collections.delete(collectionId))
  if (success) {
    collections.value = collections.value?.filter((c) => c.id !== collectionId) ?? []
    activeCollection.value = null
  }
  return success
}

const updateCollection = async (collectionId: number, newName: string) => {
  const success = await patchCollection(endpoints.collections.update(collectionId), {
    name: newName,
  })
  if (success) {
    collections.value =
      collections.value?.map((c) => {
        if (c.id === collectionId) {
          c.name = newName
        }
        return c
      }) ?? []
  }
  return success
}

function init() {
  fetchCollections(endpoints.collections.getAll)
}

init()

export function useCollectionStore() {
  return {
    activeCollection,
    collections,
    collectionsLoading,
    collectionsError,
    expandedCollections,
    loadingPostCollection,
    PostCollectionError,
    loadingPatchCollection,
    patchCollectionError,
    loadingDeleteCollection,
    deleteCollectionError,
    fetchCollections,
    toggleCollection,
    addCollection,
    removeCollection,
    updateCollection,
  }
}
