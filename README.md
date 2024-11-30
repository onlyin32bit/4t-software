# How to setup

## On Windows

- Set IP ở file .env (PUBLIC_DB_ADDRESS)
- Vào folder pocketbase_windows, chuột phải "launchDB.ps1", chọn Run with PowerShell
- Quay lại root, Open in Terminal, chạy script sau:

```bash
npm run dev -- --host --port=4444
```

## Status

- Khởi động: 100%
- Vcnv: 100%
- Tăng tốc: 70%
- Ve đích: 20%

<!-- <div >
			<div
				class="fixed bottom-[7vh] h-[84vh] w-[80vw] rounded-[1vh] bg-slate-950 bg-bg-kd bg-contain bg-center bg-no-repeat"
				bind:clientHeight={containerHeight}
			>
				<div class="absolute left-[4.3vw] top-[6vh]">
					<img class="h-[11vh] scale-x-[130%]" src="/src/lib/image/quesFrame.png" alt="" />
					<span
						class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[56%] font-number-display text-[9vh] text-black"
						>{ques}</span
					>
				</div>
				<div
					class="absolute left-1/2 top-1/2 z-50 w-[70vw] -translate-x-1/2 -translate-y-1/2 text-center font-semibold"
					style={`font-size: ${fontSize}vh;`}
					bind:clientHeight={textHeight}
				>
					<div class:invisible={!displayQuestion}>
						{questions[ques - 1]}
					</div>
				</div>
			</div>
			<div
				class="fixed bottom-[7vh] right-[2vw] flex h-[18vh] w-[14vw] items-center justify-center rounded-[1vh] bg-slate-950 text-[13vh] font-bold"
			>
				{time}
			</div>
		</div> -->
