---
id: blog-2
language: mm
default: true
date: 2026-05-02
updatedAt: 2026-05-09
---

# Offline အလုပ်လုပ်တဲ့ အကြွေးစာရင်း app (Jar Gyi)

Jar Gyi ကို စရေးခဲ့တုန်းက ကျွန်တော် သိချင်တာက ရိုးရိုးရှင်းရှင်းပါပဲ —
မြန်မာပြည်မှာ လူတွေ အကြွေးတွေ မှတ်ထားတဲ့အခါ network မရှိဘဲ
အလုပ်လုပ်နိုင်တဲ့ app လိုအပ်တယ်။ Google account မလိုဘူး။ Sync မလိုဘူး။
Offline မှာ အကုန်လုံး အလုပ်လုပ်ရမယ်။

## Architecture ရွေးချယ်မှု

- **Room** — local database၊ SQLite ပေါ်မှာ type-safe abstraction
- **DataStore** — preferences အတွက် (currency, theme)
- **ViewModel + Flow** — reactive UI
- **No account, no analytics** — privacy policy မှာ ရေးထားသလိုပါပဲ

Network module မလိုအပ်ပါဘူး။ Firebase မလိုအပ်ပါဘူး။ Crash reporting
က Crashlytics ပဲ သုံးပါတယ်။ ဒါက app ရဲ့ အဓိက design decision ပါ —
ရိုးရှင်းမှုက အဓိပ္ပါယ်ရှိတယ်။

## Data model

```kotlin
@Entity(tableName = "debts")
data class Debt(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val personName: String,
    val amount: Long,
    val type: DebtType,        // LENT or BORROWED
    val note: String?,
    val createdAt: Long,
    val dueDate: Long?
)
```

`DebtType` က `LENT` (ငါဟာ ပေးထားတယ်) နဲ့ `BORROWED` (ငါဟာ ယူထားတယ်)
နှစ်မျိုးပါ။ ယာင်ယာ တစ်ဖက်က ငါ့ကို ပေးရမှာ ဖြစ်တယ်ဆိုရင် `BORROWED`။
ငါက ယာင်ယာ တစ်ဖက်ကို ပေးထားတယ်ဆိုရင် `LENT`။

## UI ရေးထုံး

Compose ကို သုံးပါတယ်။ Material 3၊ list တွေအတွက် `LazyColumn`၊
debt အသစ်ထည့်တာက `BottomSheet`။ Flow နဲ့ reactive — debt list ပြောင်းရင်
UI အလိုအလျောက် update ဖြစ်ပါတယ်။

## ဘာကြောင့် account မလိုအပ်တာလဲ

ကျွန်တော်တို့ ပြောချင်တာ — လူတွေ ကိုယ့်ရဲ့ ငွေကြေးအခြေအနေကို
Google account နဲ့ ချိတ်စေချင်တာ မဟုတ်ဘူး။ Local-only app က
ပိုလုံခြုံပြီး ပိုရိုးရှင်းပါတယ်။ Backup လိုအပ်ရင် manual export/import
JSON နဲ့ လုပ်နိုင်ပါတယ်။

## နောက်ဆုံး

App က Play Store မှာ ရှိပါတယ်။ Source code ကို GitHub မှာ မဖြန့်ချိထားပါဘူး
— ဒါပေမယ့် architecture က ရိုးရှင်းပါတယ်။ Kotlin + Room + Compose။
ထပ်ပြီး complex ဖြစ်စရာ မလိုပါဘူး။
