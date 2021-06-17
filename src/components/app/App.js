import React from 'react';

import './App.css';
import { TreeGrid } from '../commits/tree-grid/TreeGrid'
import FilterForm from '../commits/filter-form/FilterForm'
import { useParams, useNavigate } from '@reach/router'
import Moment from 'moment'
import { DEFAULT_SHORT_DATE_FORMAT, ALL, DOWNLOAD } from "../../constants";

function App() {
  const params = useParams()
  const navigate = useNavigate()
  const dateParams = (params.dates || '').split('-')
  const date1 = parseDateParam(dateParams[0])
  const date2 = parseDateParam(dateParams[1])
  const treeGridElement = React.createRef()

  const [account] = React.useState(params.account)
  const [period] = React.useState([date1, date2])
  const [modules] = React.useState(params.modules)

  function parseDateParam (param) {
    const params = (param || '').split('.')

    if (params.length === 3) {
      return new Date(params[2], parseInt(params[1], 10) - 1, params[0])
    }

    return new Date()
  }

  function submitHandler(state) {
    const accountId = state.account ? state.account.id : ALL
    const from = Moment(state.period[0] || new Date()).format(DEFAULT_SHORT_DATE_FORMAT)
    const to = Moment(state.period[1] || new Date()).format(DEFAULT_SHORT_DATE_FORMAT)
    const modules = state.modules ? state.modules.map((item) => item.key).join(',') : ALL

    navigate(`/${accountId}/${from}-${to}/${modules}`)

    if (treeGridElement && treeGridElement.current) {
      treeGridElement.current.reset(state)
    }
  }

  return (
      <div className="app">
        {/*<div className="logo"></div>*/}
        <header>
          {/*<Toolbar left={toolbar} />*/}
          <FilterForm
              account={account}
              period={period}
              modules={modules}
              download={params.download === DOWNLOAD}
              onSubmit={submitHandler}
              onInput={submitHandler}
          />
        </header>
        {/*<aside></aside>*/}
        <main>
          <TreeGrid account={account} period={period} modules={modules} ref={treeGridElement} />
        </main>
      </div>
  )
}

export default App;
