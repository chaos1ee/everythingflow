import { request, useFormModal } from 'react-toolkits'
import useSWRMutation from 'swr/mutation'
import type { UploadFile } from 'antd'
import { Button, Form, Input, Select, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import useSWRImmutable from 'swr/immutable'
import useSWR from 'swr'

export function useVersions() {
  return useSWRImmutable<{ list: { id: number; name: string; last_version?: number }[] }>({
    url: '/api/enum/version',
  })
}

export function useCreateVersion() {
  return useSWRMutation(
    '/api/version/add',
    (
      url,
      {
        arg,
      }: {
        arg: { name: string; comment?: string; parent_version?: string }
      },
    ) =>
      request(url, {
        method: 'post',
        body: arg,
      }),
  )
}

export function useUpdateVersion() {
  return useSWRMutation(
    '/api/version/edit',
    (
      url,
      {
        arg,
      }: {
        arg: { id: string; name?: string; comment?: string }
      },
    ) =>
      request(url, {
        method: 'post',
        body: arg,
      }),
  )
}

export function useRemoveVersion() {
  return useSWRMutation(
    '/api/version/delete',
    (
      url,
      {
        arg,
      }: {
        arg: string
      },
    ) => request(url, { method: 'post', body: { id: arg } }),
  )
}

export function useUploadFile() {
  return useSWRMutation(
    '/api/upload/file',
    (
      url,
      {
        arg,
      }: {
        arg: FormData
      },
    ) =>
      request(url, {
        method: 'post',
        body: arg,
      }),
  )
}

export function useUploadTableModal(cb?: VoidFunction) {
  const upload = useUploadFile()

  return useFormModal<{
    versionId: string
    type: 'csv' | 'excel'
    fileList: UploadFile[]
    comment?: string
  }>({
    title: '上传表',
    content: (
      <>
        <Form.Item label="版本 ID" name="versionId" rules={[{ required: true }]}>
          <Input readOnly />
        </Form.Item>
        <Form.Item label="文件类型" name="type" rules={[{ required: true }]}>
          <Select
            options={[
              { label: 'Excel', value: 'excel' },
              { label: 'CSV', value: 'csv' },
            ]}
          />
        </Form.Item>
        <Form.Item
          label="文件"
          name="fileList"
          valuePropName="fileList"
          rules={[{ required: true, message: '请上传文件' }]}
          getValueFromEvent={e => e.fileList}
        >
          <Upload maxCount={1} accept=".csv,.xlsx,.xls" beforeUpload={() => false}>
            <Button icon={<UploadOutlined />}>点击上传</Button>
          </Upload>
        </Form.Item>
        <Form.Item label="备注" name="comment">
          <Input.TextArea rows={2} />
        </Form.Item>
      </>
    ),
    async onConfirm({ versionId, type, fileList, comment }) {
      const formData = new FormData()
      formData.append('version_id', versionId)
      formData.append('type', type)
      formData.append('file', fileList[0].originFileObj as File)

      if (comment) {
        formData.append('comment', comment)
      }

      await upload.trigger(formData)

      cb?.()
    },
  })
}

export function useMergeVersion() {
  return useSWRMutation(
    '/api/version/merge',
    (
      url,
      {
        arg,
      }: {
        arg: { source: string; target: string; comment?: string }
      },
    ) =>
      request(url, {
        method: 'post',
        body: arg,
      }),
  )
}

export function useDatabases() {
  return useSWR('/api/databases', url =>
    request<
      {
        name: string
        id: string
      }[]
    >(url).then(response => response.data),
  )
}
