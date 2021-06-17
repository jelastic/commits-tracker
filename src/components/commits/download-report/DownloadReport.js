import React from 'react'
import PropTypes from 'prop-types';
import ExcelJS from 'exceljs/dist/es5/exceljs.browser'
import { saveAs } from 'file-saver'

export default class DownloadReport extends React.Component {
    static propTypes = {
        filename: PropTypes.string.isRequired,
        dataSet: PropTypes.array.isRequired
    }

    static defaultProps = {
        fileExtension: '.xlsx'
    }

    componentDidMount() {
        this.download().then(() => {
            console.log("downloaded")
        })
    }

    async download() {
        const report = await this.generateReport()
        saveAs(new Blob([report]), `${this.props.filename}${this.props.fileExtension}`)
    }

    //@todo: remove duplicated code
    generateReport() {
        const wb = new ExcelJS.Workbook()

        const ws = wb.addWorksheet('Annex No 2', {views: [{showGridLines: false}]})

        ws.columns = [
            { key: 'shortId', width: 20 },
            { key: 'title', width: 80 },
            { key: 'committedDate', width: 30 }
        ];

        this.generateHeader(ws)

        let nextRow = 7

        for (const item of this.props.dataSet) {
            if (!item.data || !item.data.length) continue

            ws.mergeCells(`A${nextRow}:C${nextRow}`)

            let cell = ws.getCell(`A${nextRow}`)
            cell.value = item.module.data.shortId
            cell.font = { bold: true }
            cell.fill = {
                type: 'pattern',
                pattern:'lightGray',
                fgColor:{argb:'FF3D3D3D'},
                bgColor:{argb:'FFFFFFFF'}
            }

            nextRow += 1

            let row = ws.getRow(nextRow)
            row.values = ["Commit", "Message", "Date"]
            row.font = { bold: true }

            cell = row.getCell(1)
            cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}}
            cell.fill = { type: 'pattern', pattern:'lightGray', fgColor:{argb:'FF9E9E9E'}, bgColor:{argb:'FFFFFFFF'}}

            cell = row.getCell(2)
            cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}}
            cell.fill = { type: 'pattern', pattern:'lightGray', fgColor:{argb:'FF9E9E9E'}, bgColor:{argb:'FFFFFFFF'}}

            cell = row.getCell(3)
            cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}}
            cell.fill = { type: 'pattern', pattern:'lightGray', fgColor:{argb:'FF9E9E9E'}, bgColor:{argb:'FFFFFFFF'}}

            nextRow += 1

            for (const commit of item.data) {
                let cell = ws.getCell(`A${nextRow}`)
                cell.alignment = { horizontal: 'left' }

                if (commit.group) {
                    cell.value = commit.shortId
                    cell.font = { bold: true }
                    cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} }
                    ws.mergeCells(`A${nextRow}:C${nextRow}`)
                } else {
                    cell.value = {
                        text: commit.shortId,
                        hyperlink: commit.webUrl
                    }

                    cell.border = {
                        top: {style:'thin'},
                        left: {style:'thin'},
                        bottom: {style:'thin'},
                        right: {style:'thin'}
                    }

                    cell = ws.getCell(`B${nextRow}`)
                    cell.value = commit.title
                    cell.border = {
                        top: {style:'thin'},
                        left: {style:'thin'},
                        bottom: {style:'thin'},
                        right: {style:'thin'}
                    }

                    cell = ws.getCell(`C${nextRow}`)
                    cell.value = commit.committedDate
                    cell.border = {
                        top: {style:'thin'},
                        left: {style:'thin'},
                        bottom: {style:'thin'},
                        right: {style:'thin'}
                    }
                }

                nextRow += 1
            }

            nextRow += 2
        }

        return wb.xlsx.writeBuffer()
    }

    generateHeader(ws) {
        function addRows(rows) {
            for (let i = 0, n = rows.length; i < n; i++) {
                const index = i + 1
                const text = rows[i].text || rows[i] || ''

                const row = ws.addRow([text])

                if (rows[i].richText) {
                    row.getCell(1).value = {
                        richText: rows[i].richText
                    }
                }

                if (rows[i].height) {
                    row.height = rows[i].height
                }

                ws.mergeCells(`A${index}:C${index}`)

                const cell = ws.getCell(`A${index}`)
                cell.alignment = rows[i].alignment || { vertical: 'center', horizontal: 'left', wrapText: true }

                if (rows[i].font) {
                    cell.font = rows[i].font
                }
            }
        }

        addRows([
            { text: 'Annex No 2', alignment: { horizontal: 'center' }, font: { bold: true, underline: 'single' } },
            { richText: [
                    { text: 'This Annex No 2 is an integral part of the Agreement No. '},
                    { text: "[_]", font: { bold: true }},
                    { text: " made on "},
                    { text:"31 December 2020", font: { bold: true }},
                    { text: " by and between "},
                    { text: "[name_of_the_company]", font: { bold: true }},
                    { text: " and private entrepreneur "},
                    { text: "[full_name_of_the_entrepreneur]", font: { bold: true }},
                    { text: "."}
                ], height: 50 },
            { text: 'This Annex No 2 is made in electronic form.' },
            { text: 'For purposes of the Agreement the Add-Ons include, but are not limited to, the following modules:', height: 30}
        ])
    }

    render() {
        return null
    }
}