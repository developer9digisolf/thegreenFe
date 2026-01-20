import React from 'react'
import { IModelDefinitions } from '@afx/interfaces/global.iface'
import { IExample, IResExample } from '@afx/interfaces/example.iface'
import { notification } from 'antd'
import { ExamplePostService } from '@afx/services/example.service'

// declaring interface Action for Model (Required)
export type IActionTest = {
    examplePost: (data: IExample) => void
    exampleGet: () => void
    exampleDel: (Id: number, callback: () => void) => void
}

// declaring interface State for Model (Required)
export type IStateTest = {
    dataExample: IResExample
}

const exampleModels: IModelDefinitions<IStateTest, IActionTest> = {
    name: 'example',
    model: (put, getStates, getActions) => ({
        state: {
            dataExample: {} as IResExample
        },
        actions: {
            async examplePost(data) {
                try {
                    const res = await ExamplePostService(data)
                    notification.success({
                        message: 'Success',
                        description: 'success',
                        duration: 2,
                        key: "FUNC-EXAMPLE-POST"
                    })
                } catch (err: any) {
                    notification.warning({
                        message: 'Failed to load data',
                        description: err?.meta?.message,
                        duration: 2,
                        key: 'FUNC-EXAMPLE-POST'
                    })
                }
            },
            async exampleGet() {
                const data = { name: "exmaple" }
                put({
                    dataExample: data
                })
            },
            async exampleDel(Id, callback) {
                // delete data
                callback()
            },
        }
    })
}

export default exampleModels