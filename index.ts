import { type paths } from '@/lib/openapi/types'
import {
  type Client,
  type InitParam,
  type MaybeOptionalInit,
} from 'openapi-fetch'
import { type PathsWithMethod } from 'openapi-typescript-helper'
import { type Key } from 'swr'
import useSWRMutation from 'swr/mutation'

export type HttMethod = 'post' | 'put' | 'delete'

export function createMutationHook(client: Client<paths>) {
  return function useMutation<
    Method extends HttpMethod,
    Path extends PathsWithMethod<paths, Method>,
    R extends paths[Path][Method],
    RequestBody = R extends object
      ? R['requestBody']['content']['application/json']
      : never,
    ResponseData = R extends object
      ? R['responses'][200]['content']['application/json']
      : never
  >(path: Path, method: Method) {
    const fetcher = async (url: Path, { arg }: { arg: RequestBody }) => {
      const request = [{ body: arg }] as InitParam<
        MaybeOptionalInit<paths[Path], Method>
      >

      const response = await client.request(method, url, ...request)

      if (response.error) {
        throw new Error(String(response.error))
      }

      return response.data as ResponseData
    }

    return useSWRMutation<ResponseData, Error, Key, RequestBody>(path, fetcher)
  }
}
