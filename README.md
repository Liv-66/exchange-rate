# exchange-rate
進入體驗：https://exchange-rate-asiayo.herokuapp.com/

新台幣TWD為主的匯率換算，可選擇各種幣別換算為TWD，或是TWD換算為各種幣別
匯率資訊來源：Float Rates (每日更新)

## 程式簡述
- 進入頁面時，向來源網站取得最新匯率(xml)，解析後將資訊呈現於頁面
- 頁面兩個主要區塊分別為「Currency Converter」與「Dashboard」，Converter貨幣選單呈現來源網站所提供之貨幣選項，Dashboard呈現當前選擇貨幣的常用金額雙向匯率
- Convert按鈕點選後於後端確認輸入資料，資料正確則以轉換後金額取代Convert按鈕，資料有誤則呈現對應錯誤提示
- Switch按鈕可對調換算方向
- 金額輸入匡、貨幣選單、switch按鈕，以上功能在更動後，皆會即時進行匯率換算與Dashboard資料轉換
