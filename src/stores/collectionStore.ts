import { endpoints } from '@/api/endpoints'
import { useDelete } from '@/composables/api/useDelete'
import { useFetch } from '@/composables/api/useFetch'
import { usePatch } from '@/composables/api/usePatch'
import { usePost } from '@/composables/api/usePost'
import type { Collection } from '@/types/collection'
import { ref } from 'vue'

const showAddCollectionModal = ref(false)
const showDeleteCollectionModal = ref(false)
const showRenameCollectionModal = ref(false)
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

const toggleCollection = (collection_id: number) => {}

const handleAddCollection = async (name: string) => {
  const success = await postCollection(endpoints.collections.create, { name: name })
  if (success) {
    showAddCollectionModal.value = false
    await fetchCollections(endpoints.collections.getAll)
  }
}

const handleDeleteCollection = async (collectionId: number) => {
  const success = await deleteCollection(endpoints.collections.delete(collectionId))
  if (success) {
    showDeleteCollectionModal.value = false
    collections.value = collections.value?.filter((c) => c.id !== collectionId) ?? []
    activeCollection.value = null
  }
}

const handlePatchCollection = async (collectionId: number, newName: string) => {
  const success = await patchCollection(endpoints.collections.update(collectionId), {
    name: newName,
  })
  if (success) {
    showRenameCollectionModal.value = false
    collections.value = collections.value!.map((c) => {
      if (c.id === collectionId) {
        c.name = newName
      }
      return c
    })
  }
}

function init() {
  fetchCollections(endpoints.collections.getAll)
}

init()

export function collectionStore() {
  return {
    activeCollection,
    showAddCollectionModal,
    showDeleteCollectionModal,
    showRenameCollectionModal,
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
    handleAddCollection,
    handleDeleteCollection,
    handlePatchCollection,
  }
}
