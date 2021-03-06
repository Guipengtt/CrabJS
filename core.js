 (function (storeName, core, global) {

     // 支持AMDjs, Commonjs, ES6
     if (typeof define == 'function') {
         define(core)
     } else if (!!module && !!module.exports) {
         module.exports = core();
     } else {
         global[storeName] = core();
     }

     var defaultSuccessHandler = function () {};
     var defaultErrorHandler = function (error) {
         throw error;
     };

     var defaults = {
         storeName: 'Store',
         storePrefix: 'Crab-',
         dbVersion: 1,
         keyPath: 'id',
         autoIncrement: true,
         onStoreReady: function () {},
         onError: defaultErrorHandler,
         index: [],
     };

     //  constructor
     var CrabStore = function (kwArgs, onStoreReady) {
         if (!onStoreReady && typeof kwArgs == 'function') {
             onStoreReady = kwArgs;
         }
         if (Object.prototype.toString.call(kwArgs) != '[object Object]') {
             kwArgs = {};
         }

         for (var key in defaults) {
             this[key] = !!kwArgs[key] ? kwArgs[key] : defaults[key];
         }

         this.dbName = this.storePrefix + this.storeName;
         this.dbVersion = parseInt(this.dbVersion, 10) || 1;

         onStoreReady && (this.onStoreReady = onStoreReady);

         var env = typeof window == 'object' ? window : self;

         try {
             this.idb = env['indexedDB'];
         } catch (e) {
             console.warn("Current environment does not support indexedDB");
         };

         this.keyRange = env.IDBKeyRange;

         this.consts = {
             'READ_ONLY': 'readonly',
             'READ_WRITE': 'readwrite',
             'VERSION_CHANGE': 'versionchange',
             'NEXT': 'next',
             'NEXT_NO_DUPLICATE': 'nextunique',
             'PREV': 'prev',
             'PREV_NO_DUPLICATE': 'prevunique'
         };

         this.openDB();


         var proto = {
             constructor: CrabStore,
             version: '1.0',
             db: null,
             dbName: null,
             dbVersion: null,
             store: null,
             storeName: null,
             storePrefix: null,
             keyPath: null,
             autoIncrement: null,
             indexes: null,
             implementation: 'indexedDB',
             onStoreReady: null,
             onError: null,

             openDB: function () {
                 var openRequest = this.idb.open(this.dbName, this.dbVersion);
                 var preventSuccessCallBack = false;

                 openRequest.onsuccess = function (event) {
                     if (preventSuccessCallBack) {
                         return;
                     }

                     if (this.db) {
                         this.onStoreReady();
                     }
                     this.db = event.target.result;


                 }.bind(this);

                 openRequest.onerror = function (errorEvent) {
                     this.onError(new Error(`Crabjs Error: ${errorEvent.target.error}`))
                 }.bind(this);

                 openRequest.onupgradeneeded = function () {}
             }
         }


     }
 })("CRABStore", function () {

 }, this)