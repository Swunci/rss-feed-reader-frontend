import { endpoints } from '@/api/endpoints'
import { useDelete } from '@/composables/api/useDelete'
import { useFetch } from '@/composables/api/useFetch'
import { usePut } from '@/composables/api/usePut'
import { usePost } from '@/composables/api/usePost'
import type { Collection } from '@/types/collection'
import type { Feed } from '@/types/feed'
import { ref } from 'vue'
import log from '@/utils/logger'

const activeCollection = ref<Collection | null>(null)

const expandedCollections = ref<Set<number>>(new Set())

const collectionFeedsMap = ref<Record<number, Feed[]>>({})

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
  loading: loadingPutCollection,
  error: PutCollectionError,
  putData: putCollection,
} = usePut()
const {
  loading: loadingDeleteCollection,
  error: deleteCollectionError,
  deleteData: deleteCollection,
} = useDelete()

const toggleCollection = (collectionId: number) => {
  if (expandedCollections.value.has(collectionId)) expandedCollections.value.delete(collectionId)
  else {
    expandedCollections.value.add(collectionId)
  }
}

const expandCollection = (collectionId: number) => {
  expandedCollections.value.add(collectionId)
}

const addCollection = async (name: string) => {
  const success = await postCollection(endpoints.collections.create, { name: name })
  if (success) {
    log.debug('Collection added', { name })
    await fetchCollections(endpoints.collections.getAll)
  }
  return success
}

const removeCollection = async (collectionId: number) => {
  const success = await deleteCollection(endpoints.collections.delete(collectionId))
  if (success) {
    log.debug('Collection removed', { collectionId })
    collections.value = collections.value?.filter((c) => c.id !== collectionId) ?? []
    activeCollection.value = null
  }
  return success
}

const updateCollection = async (collectionId: number, newName: string) => {
  const success = await putCollection(endpoints.collections.update(collectionId), {
    name: newName,
  })
  if (success) {
    log.debug('Collection updated', { collectionId, newName })
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

function isInActiveCollection(feedId: number | undefined): boolean {
  if (!activeCollection.value || !feedId) return false
  return collectionFeedsMap.value[activeCollection.value.id]?.some((f) => f.id === feedId) ?? false
}

async function init() {
  await fetchCollections(endpoints.collections.getAll)
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
    loadingPutCollection,
    PutCollectionError,
    loadingDeleteCollection,
    deleteCollectionError,
    collectionFeedsMap,
    fetchCollections,
    toggleCollection,
    expandCollection,
    addCollection,
    removeCollection,
    updateCollection,
    isInActiveCollection,
  }
}
