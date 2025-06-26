'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/questions/import-csv',
      handler: 'question.importCsv',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/questions/import-xlsx',
      handler: 'question.importXlsx',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/questions/bulk-import',
      handler: 'question.bulkImport',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 