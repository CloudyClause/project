/* =========================================================
   Trip Planner Ver.2
   script.js

   주요 기능
   1. Splash
   2. Home
   3. Sample Trip
   4. Settings
   5. Trip CRUD
   6. Itinerary CRUD
   7. Budget CRUD
   8. Checklist CRUD
   9. Today / Next Schedule
   10. Trip Complete
   11. LocalStorage
========================================================= */


/* =========================================================
   01. STORAGE KEY
========================================================= */

const STORAGE_KEYS = {
  trips: "tripPlanner.trips.v2",
  settings: "tripPlanner.settings.v2"
};


/* =========================================================
   02. APP STATE
========================================================= */

const state = {
  trips: [],
  settings: {
    defaultTravelers: 2,
    currency: "KRW",
    sampleInitialized: false
  },

  currentTripId: null,
  selectedDate: null,
  currentScreen: "splash",

  confirmAction: null
};


/* =========================================================
   03. DOM
========================================================= */

const screens = document.querySelectorAll(".screen");


/* Splash */

const splashScreen =
  document.getElementById("splashScreen");


/* Home */

const homeScreen =
  document.getElementById("homeScreen");

const settingsButton =
  document.getElementById("settingsButton");

const sampleTripContainer =
  document.getElementById("sampleTripContainer");

const myTripList =
  document.getElementById("myTripList");

const myTripCount =
  document.getElementById("myTripCount");

const myTripEmptyState =
  document.getElementById("myTripEmptyState");

const newTripButton =
  document.getElementById("newTripButton");


/* Settings */

const defaultTravelersSelect =
  document.getElementById("defaultTravelersSelect");

const currencySelect =
  document.getElementById("currencySelect");

const restoreSampleButton =
  document.getElementById("restoreSampleButton");

const resetAllDataButton =
  document.getElementById("resetAllDataButton");


/* Trip Form */

const tripForm =
  document.getElementById("tripForm");

const tripId =
  document.getElementById("tripId");

const tripTitle =
  document.getElementById("tripTitle");

const tripDestination =
  document.getElementById("tripDestination");

const tripStartDate =
  document.getElementById("tripStartDate");

const tripEndDate =
  document.getElementById("tripEndDate");

const tripTravelers =
  document.getElementById("tripTravelers");

const tripBudget =
  document.getElementById("tripBudget");

const tripMemo =
  document.getElementById("tripMemo");

const tripDatePreview =
  document.getElementById("tripDatePreview");

const tripFormHeaderTitle =
  document.getElementById("tripFormHeaderTitle");

const saveTripButton =
  document.getElementById("saveTripButton");

const tripFormBackButton =
  document.getElementById("tripFormBackButton");


/* Dashboard */

const dashboardHeaderTitle =
  document.getElementById("dashboardHeaderTitle");

const dashboardHero =
  document.getElementById("dashboardHero");

const dashboardSummary =
  document.getElementById("dashboardSummary");

const travelProgressStep =
  document.getElementById("travelProgressStep");

const todayScheduleHeading =
  document.getElementById("todayScheduleHeading");

const todayScheduleList =
  document.getElementById("todayScheduleList");

const nextScheduleCard =
  document.getElementById("nextScheduleCard");

const dashboardBudget =
  document.getElementById("dashboardBudget");

const dashboardMemo =
  document.getElementById("dashboardMemo");

const editTripButton =
  document.getElementById("editTripButton");

const viewAllScheduleButton =
  document.getElementById("viewAllScheduleButton");

const dashboardBudgetButton =
  document.getElementById("dashboardBudgetButton");

const deleteTripButton =
  document.getElementById("deleteTripButton");

const tripCompleteBanner =
  document.getElementById("tripCompleteBanner");

const viewTripCompleteButton =
  document.getElementById("viewTripCompleteButton");


/* Itinerary */

const dayTabList =
  document.getElementById("dayTabList");

const selectedDayTitle =
  document.getElementById("selectedDayTitle");

const scheduleTimeline =
  document.getElementById("scheduleTimeline");

const scheduleEmptyState =
  document.getElementById("scheduleEmptyState");

const addScheduleButton =
  document.getElementById("addScheduleButton");


/* Budget */

const budgetSummaryCard =
  document.getElementById("budgetSummaryCard");

const budgetProgressPercent =
  document.getElementById("budgetProgressPercent");

const budgetProgressBar =
  document.getElementById("budgetProgressBar");

const budgetProgressMessage =
  document.getElementById("budgetProgressMessage");

const budgetCategoryList =
  document.getElementById("budgetCategoryList");

const expenseList =
  document.getElementById("expenseList");

const expenseEmptyState =
  document.getElementById("expenseEmptyState");

const addExpenseButton =
  document.getElementById("addExpenseButton");


/* Checklist */

const checkProgressPercent =
  document.getElementById("checkProgressPercent");

const checkProgressBar =
  document.getElementById("checkProgressBar");

const checkProgressDescription =
  document.getElementById("checkProgressDescription");

const checklistList =
  document.getElementById("checklistList");

const checklistEmptyState =
  document.getElementById("checklistEmptyState");

const addChecklistButton =
  document.getElementById("addChecklistButton");


/* Trip Complete */

const completeTripTitle =
  document.getElementById("completeTripTitle");

const completeSummaryGrid =
  document.getElementById("completeSummaryGrid");

const completeHomeButton =
  document.getElementById("completeHomeButton");


/* Schedule Modal */

const scheduleModal =
  document.getElementById("scheduleModal");

const scheduleForm =
  document.getElementById("scheduleForm");

const scheduleId =
  document.getElementById("scheduleId");

const scheduleDate =
  document.getElementById("scheduleDate");

const scheduleTime =
  document.getElementById("scheduleTime");

const scheduleTitle =
  document.getElementById("scheduleTitle");

const scheduleCategory =
  document.getElementById("scheduleCategory");

const scheduleLocation =
  document.getElementById("scheduleLocation");

const scheduleCost =
  document.getElementById("scheduleCost");

const scheduleMemo =
  document.getElementById("scheduleMemo");

const scheduleModalTitle =
  document.getElementById("scheduleModalTitle");

const saveScheduleButton =
  document.getElementById("saveScheduleButton");


/* Expense Modal */

const expenseModal =
  document.getElementById("expenseModal");

const expenseForm =
  document.getElementById("expenseForm");

const expenseId =
  document.getElementById("expenseId");

const expenseDate =
  document.getElementById("expenseDate");

const expenseTitle =
  document.getElementById("expenseTitle");

const expenseCategory =
  document.getElementById("expenseCategory");

const expenseAmount =
  document.getElementById("expenseAmount");

const expenseModalTitle =
  document.getElementById("expenseModalTitle");

const saveExpenseButton =
  document.getElementById("saveExpenseButton");


/* Checklist Modal */

const checklistModal =
  document.getElementById("checklistModal");

const checklistForm =
  document.getElementById("checklistForm");

const checklistTitle =
  document.getElementById("checklistTitle");


/* Confirm */

const confirmModal =
  document.getElementById("confirmModal");

const confirmModalTitle =
  document.getElementById("confirmModalTitle");

const confirmModalMessage =
  document.getElementById("confirmModalMessage");

const confirmCancelButton =
  document.getElementById("confirmCancelButton");

const confirmActionButton =
  document.getElementById("confirmActionButton");


/* Toast */

const toast =
  document.getElementById("toast");


/* =========================================================
   04. BASIC UTILITY
========================================================= */


/* 안전한 HTML 출력 */

function escapeHTML(value = "") {

  return String(value)

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");
}


/* 고유 ID */

function createId() {

  if (
    window.crypto &&
    typeof window.crypto.randomUUID === "function"
  ) {

    return crypto.randomUUID();
  }


  return (
    Date.now().toString() +
    "-" +
    Math.random().toString(16).slice(2)
  );
}


/* Lucide 아이콘 재적용 */

function refreshIcons() {

  if (
    window.lucide &&
    typeof window.lucide.createIcons === "function"
  ) {

    window.lucide.createIcons();
  }
}


/* =========================================================
   05. DATE UTILITY
========================================================= */


/*
  YYYY-MM-DD 문자열을
  Local Date 객체로 안전하게 변환
*/

function parseLocalDate(dateString) {

  if (
    !dateString ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dateString)
  ) {

    return null;
  }


  const [year, month, day] =
    dateString
      .split("-")
      .map(Number);


  const date =
    new Date(
      year,
      month - 1,
      day
    );


  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {

    return null;
  }


  return date;
}


/* Date → YYYY-MM-DD */

function toISODate(date) {

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");


  return `${year}-${month}-${day}`;
}


/* 오늘 */

function getTodayISO() {

  return toISODate(
    new Date()
  );
}


/* 날짜 더하기 */

function addDays(date, days) {

  const result =
    new Date(date);

  result.setDate(
    result.getDate() + days
  );

  return result;
}


/* 09.15 */

function formatShortDate(dateString) {

  const date =
    parseLocalDate(dateString);


  if (!date) {

    return "-";
  }


  return (
    String(
      date.getMonth() + 1
    ).padStart(2, "0") +
    "." +
    String(
      date.getDate()
    ).padStart(2, "0")
  );
}


/* 2026.09.15 */

function formatLongDate(dateString) {

  const date =
    parseLocalDate(dateString);


  if (!date) {

    return "-";
  }


  return (
    date.getFullYear() +
    "." +
    String(
      date.getMonth() + 1
    ).padStart(2, "0") +
    "." +
    String(
      date.getDate()
    ).padStart(2, "0")
  );
}


/* 여행 일수 */

function getTripDays(
  startDate,
  endDate
) {

  const start =
    parseLocalDate(startDate);

  const end =
    parseLocalDate(endDate);


  if (
    !start ||
    !end ||
    end < start
  ) {

    return 0;
  }


  const difference =
    end.getTime() -
    start.getTime();


  return (
    Math.floor(
      difference / 86400000
    ) + 1
  );
}


/* 날짜 범위 배열 */

function getDateRange(
  startDate,
  endDate
) {

  const start =
    parseLocalDate(startDate);

  const end =
    parseLocalDate(endDate);


  if (
    !start ||
    !end ||
    end < start
  ) {

    return [];
  }


  const dates = [];

  const current =
    new Date(start);


  while (
    current <= end
  ) {

    dates.push(
      toISODate(current)
    );


    current.setDate(
      current.getDate() + 1
    );
  }


  return dates;
}


/* =========================================================
   06. NUMBER / CURRENCY
========================================================= */

function formatCurrency(value) {

  const number =
    Number(value) || 0;


  const currency =
    state.settings.currency;


  if (currency === "USD") {

    return `$${number.toLocaleString()}`;
  }


  if (currency === "JPY") {

    return `¥${number.toLocaleString()}`;
  }


  if (currency === "EUR") {

    return `€${number.toLocaleString()}`;
  }


  return `${number.toLocaleString("ko-KR")}원`;
}


/* =========================================================
   07. TRIP STATUS
========================================================= */

function getTripStatus(trip) {

  const today =
    parseLocalDate(
      getTodayISO()
    );

  const start =
    parseLocalDate(
      trip.startDate
    );

  const end =
    parseLocalDate(
      trip.endDate
    );


  if (
    !today ||
    !start ||
    !end
  ) {

    return {
      text: "날짜 확인",
      type: "gray"
    };
  }


  if (
    today < start
  ) {

    const difference =
      Math.ceil(
        (start - today) /
        86400000
      );


    return {
      text: `D-${difference}`,
      type: "future"
    };
  }


  if (
    today <= end
  ) {

    return {
      text: "여행 중",
      type: "active"
    };
  }


  return {
    text: "여행 완료",
    type: "complete"
  };
}


/* =========================================================
   08. CURRENT TRIP
========================================================= */

function getCurrentTrip() {

  return (
    state.trips.find(
      trip =>
        trip.id ===
        state.currentTripId
    ) || null
  );
}


/* =========================================================
   09. CALCULATION
========================================================= */

function calculateTotalExpense(trip) {

  return trip.expenses.reduce(
    (sum, expense) => {

      return (
        sum +
        Number(
          expense.amount || 0
        )
      );

    },
    0
  );
}


function calculateChecklistProgress(
  trip
) {

  const total =
    trip.checklist.length;


  if (total === 0) {

    return {
      total: 0,
      completed: 0,
      percent: 0
    };
  }


  const completed =
    trip.checklist.filter(
      item => item.completed
    ).length;


  return {

    total,

    completed,

    percent:
      Math.round(
        completed /
        total *
        100
      )
  };
}


/* =========================================================
   10. LOCAL STORAGE
========================================================= */

function saveTrips() {

  try {

    localStorage.setItem(
      STORAGE_KEYS.trips,
      JSON.stringify(
        state.trips
      )
    );

  } catch (error) {

    console.error(
      "여행 데이터 저장 오류:",
      error
    );


    showToast(
      "여행 데이터를 저장하지 못했습니다."
    );
  }
}


function saveSettings() {

  try {

    localStorage.setItem(
      STORAGE_KEYS.settings,
      JSON.stringify(
        state.settings
      )
    );

  } catch (error) {

    console.error(
      "설정 저장 오류:",
      error
    );
  }
}


function loadData() {

  /* Trip */

  try {

    const tripData =
      localStorage.getItem(
        STORAGE_KEYS.trips
      );


    if (tripData) {

      const parsedTrips =
        JSON.parse(
          tripData
        );


      if (
        Array.isArray(
          parsedTrips
        )
      ) {

        state.trips =
          parsedTrips.map(
            normalizeTrip
          );
      }
    }

  } catch (error) {

    console.error(
      "여행 데이터 불러오기 오류:",
      error
    );


    state.trips = [];
  }


  /* Settings */

  try {

    const settingData =
      localStorage.getItem(
        STORAGE_KEYS.settings
      );


    if (settingData) {

      const parsed =
        JSON.parse(
          settingData
        );


      state.settings = {

        ...state.settings,

        ...parsed
      };
    }

  } catch (error) {

    console.error(
      "설정 데이터 불러오기 오류:",
      error
    );
  }
}


/* 기존 데이터가 일부 부족해도
   오류가 발생하지 않도록 기본값 추가 */

function normalizeTrip(trip) {

  return {

    id:
      String(
        trip?.id ||
        createId()
      ),

    isSample:
      Boolean(
        trip?.isSample
      ),

    title:
      String(
        trip?.title || ""
      ),

    destination:
      String(
        trip?.destination || ""
      ),

    startDate:
      String(
        trip?.startDate || ""
      ),

    endDate:
      String(
        trip?.endDate || ""
      ),

    travelers:
      Math.max(
        1,
        Number(
          trip?.travelers
        ) || 1
      ),

    budget:
      Math.max(
        0,
        Number(
          trip?.budget
        ) || 0
      ),

    memo:
      String(
        trip?.memo || ""
      ),

    schedules:
      Array.isArray(
        trip?.schedules
      )
        ? trip.schedules
        : [],

    expenses:
      Array.isArray(
        trip?.expenses
      )
        ? trip.expenses
        : [],

    checklist:
      Array.isArray(
        trip?.checklist
      )
        ? trip.checklist
        : []
  };
}


/* =========================================================
   11. SAMPLE TRIP
========================================================= */

function createSampleTrip() {

  const today =
    new Date();


  const start =
    addDays(
      today,
      18
    );


  const day2 =
    addDays(
      start,
      1
    );


  const end =
    addDays(
      start,
      2
    );


  const startDate =
    toISODate(start);

  const day2Date =
    toISODate(day2);

  const endDate =
    toISODate(end);


  return {

    id:
      "sample-jeju-trip",

    isSample:
      true,

    title:
      "제주도 2박 3일 여행",

    destination:
      "제주도",

    startDate,

    endDate,

    travelers:
      2,

    budget:
      1000000,

    memo:
      "렌터카 인수 전 차량 상태를 확인하고, 숙소 체크인 시간을 미리 확인해두기.",


    schedules: [

      {
        id: createId(),
        date: startDate,
        time: "09:30",
        title: "제주공항 도착",
        category: "교통",
        location: "제주국제공항",
        cost: 0,
        memo: ""
      },

      {
        id: createId(),
        date: startDate,
        time: "11:00",
        title: "자매국수",
        category: "음식",
        location: "제주시",
        cost: 35000,
        memo: "점심 식사"
      },

      {
        id: createId(),
        date: startDate,
        time: "14:00",
        title: "애월 카페",
        category: "카페",
        location: "애월",
        cost: 18000,
        memo: ""
      },

      {
        id: createId(),
        date: startDate,
        time: "17:00",
        title: "호텔 체크인",
        category: "숙소",
        location: "제주시",
        cost: 0,
        memo: ""
      },

      {
        id: createId(),
        date: day2Date,
        time: "10:00",
        title: "오설록 티뮤지엄",
        category: "관광",
        location: "서귀포시",
        cost: 42000,
        memo: ""
      },

      {
        id: createId(),
        date: day2Date,
        time: "13:00",
        title: "협재 해수욕장",
        category: "관광",
        location: "한림읍",
        cost: 0,
        memo: ""
      },

      {
        id: createId(),
        date: day2Date,
        time: "18:00",
        title: "제주 흑돼지 저녁",
        category: "음식",
        location: "제주시",
        cost: 0,
        memo: ""
      },

      {
        id: createId(),
        date: endDate,
        time: "11:00",
        title: "기념품 쇼핑",
        category: "쇼핑",
        location: "제주시",
        cost: 0,
        memo: ""
      },

      {
        id: createId(),
        date: endDate,
        time: "16:00",
        title: "제주공항 이동",
        category: "교통",
        location: "제주국제공항",
        cost: 0,
        memo: ""
      }

    ],


    expenses: [

      {
        id: createId(),
        date: startDate,
        title: "렌터카",
        category: "교통",
        amount: 120000
      },

      {
        id: createId(),
        date: startDate,
        title: "숙소",
        category: "숙박",
        amount: 220000
      },

      {
        id: createId(),
        date: startDate,
        title: "점심",
        category: "식비",
        amount: 35000
      },

      {
        id: createId(),
        date: startDate,
        title: "카페",
        category: "식비",
        amount: 18000
      },

      {
        id: createId(),
        date: day2Date,
        title: "관광",
        category: "관광",
        amount: 42000
      }

    ],


    checklist: [

      {
        id: createId(),
        title: "신분증",
        completed: true
      },

      {
        id: createId(),
        title: "항공권",
        completed: true
      },

      {
        id: createId(),
        title: "숙소 예약 확인",
        completed: true
      },

      {
        id: createId(),
        title: "충전기",
        completed: true
      },

      {
        id: createId(),
        title: "보조배터리",
        completed: false
      },

      {
        id: createId(),
        title: "우산",
        completed: false
      },

      {
        id: createId(),
        title: "상비약",
        completed: false
      }

    ]
  };
}


/* 최초 실행 */

function initializeSampleTrip() {

  if (
    state.settings.sampleInitialized
  ) {

    return;
  }


  const sample =
    createSampleTrip();


  state.trips.unshift(
    sample
  );


  state.settings.sampleInitialized =
    true;


  saveTrips();

  saveSettings();
}


/* 샘플 복원 */

function restoreSampleTrip() {

  const exists =
    state.trips.some(
      trip =>
        trip.isSample
    );


  if (exists) {

    showToast(
      "샘플 여행이 이미 있습니다."
    );

    return;
  }


  state.trips.unshift(
    createSampleTrip()
  );


  saveTrips();

  renderHome();

  showToast(
    "샘플 여행을 다시 불러왔습니다."
  );
}


/* =========================================================
   12. SCREEN
========================================================= */

function showScreen(screenName) {

  state.currentScreen =
    screenName;


  screens.forEach(
    screen => {

      screen.classList.toggle(
        "active",
        screen.dataset.screen ===
        screenName
      );
    }
  );


  if (
    screenName === "home"
  ) {

    renderHome();
  }


  if (
    screenName === "settings"
  ) {

    renderSettings();
  }


  if (
    screenName === "dashboard"
  ) {

    renderDashboard();
  }


  if (
    screenName === "itinerary"
  ) {

    renderItinerary();
  }


  if (
    screenName === "budget"
  ) {

    renderBudget();
  }


  if (
    screenName === "checklist"
  ) {

    renderChecklist();
  }


  if (
    screenName === "trip-complete"
  ) {

    renderTripComplete();
  }


  refreshIcons();


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   13. SPLASH
========================================================= */

function startSplash() {

  showScreen(
    "splash"
  );


  setTimeout(
    () => {

      showScreen(
        "home"
      );

    },
    1500
  );
}


/* =========================================================
   14. HOME
========================================================= */

function renderHome() {

  renderSampleTrip();

  renderMyTrips();

  refreshIcons();
}


function renderSampleTrip() {

  const sample =
    state.trips.find(
      trip =>
        trip.isSample
    );


  if (!sample) {

    sampleTripContainer.innerHTML = `
      <div class="empty-state">

        <div class="empty-state-icon">
          <i data-lucide="map"></i>
        </div>

        <h3>
          샘플 여행이 없습니다.
        </h3>

        <p>
          설정에서 샘플 여행을 다시 불러올 수 있어요.
        </p>

      </div>
    `;


    return;
  }


  const status =
    getTripStatus(sample);

  const progress =
    calculateChecklistProgress(
      sample
    );


  sampleTripContainer.innerHTML = `
    <article class="sample-trip-card">

      <span class="sample-badge">
        SAMPLE
      </span>

      <h3>
        ${escapeHTML(sample.title)}
      </h3>

      <p class="sample-trip-meta">
        ${formatShortDate(sample.startDate)}
        -
        ${formatShortDate(sample.endDate)}
        ·
        ${sample.travelers}명
      </p>


      <div class="sample-trip-stats">

        <div class="sample-stat">

          <span>
            출발
          </span>

          <strong>
            ${escapeHTML(status.text)}
          </strong>

        </div>


        <div class="sample-stat">

          <span>
            일정
          </span>

          <strong>
            ${sample.schedules.length}개
          </strong>

        </div>


        <div class="sample-stat">

          <span>
            준비
          </span>

          <strong>
            ${progress.percent}%
          </strong>

        </div>

      </div>


      <button
        type="button"
        class="sample-trip-button"
        data-open-trip="${sample.id}"
      >

        샘플 둘러보기

        <i data-lucide="arrow-right"></i>

      </button>

    </article>
  `;
}


function renderMyTrips() {

  const userTrips =
    state.trips.filter(
      trip =>
        !trip.isSample
    );


  myTripCount.textContent =
    userTrips.length;


  if (
    userTrips.length === 0
  ) {

    myTripList.innerHTML = "";

    myTripEmptyState.classList.remove(
      "hidden"
    );

    return;
  }


  myTripEmptyState.classList.add(
    "hidden"
  );


  const sortedTrips =
    [...userTrips].sort(
      (a, b) =>
        a.startDate.localeCompare(
          b.startDate
        )
    );


  myTripList.innerHTML =
    sortedTrips
      .map(
        trip => {

          const status =
            getTripStatus(
              trip
            );

          const progress =
            calculateChecklistProgress(
              trip
            );


          return `
            <button
              type="button"
              class="my-trip-card"
              data-open-trip="${trip.id}"
            >

              <div class="my-trip-card-top">

                <div>

                  <h3>
                    ${escapeHTML(trip.title)}
                  </h3>

                  <p class="my-trip-destination">
                    📍
                    ${escapeHTML(trip.destination)}
                  </p>

                </div>


                <span class="trip-status-badge">
                  ${escapeHTML(status.text)}
                </span>

              </div>


              <div class="my-trip-card-bottom">

                <span class="my-trip-date">

                  ${formatShortDate(trip.startDate)}

                  -

                  ${formatShortDate(trip.endDate)}

                </span>


                <div class="my-trip-mini-info">

                  <span class="mini-info-chip">
                    일정 ${trip.schedules.length}
                  </span>

                  <span class="mini-info-chip">
                    준비 ${progress.percent}%
                  </span>

                </div>

              </div>

            </button>
          `;
        }
      )
      .join("");
}


/* =========================================================
   15. OPEN TRIP
========================================================= */

function openTrip(
  tripIdValue
) {

  const trip =
    state.trips.find(
      item =>
        item.id ===
        tripIdValue
    );


  if (!trip) {

    showToast(
      "여행 정보를 찾을 수 없습니다."
    );

    return;
  }


  state.currentTripId =
    trip.id;


  state.selectedDate =
    trip.startDate;


  showScreen(
    "dashboard"
  );
}


/* =========================================================
   16. SETTINGS
========================================================= */

function renderSettings() {

  defaultTravelersSelect.value =
    String(
      state.settings.defaultTravelers
    );


  currencySelect.value =
    state.settings.currency;
}


defaultTravelersSelect.addEventListener(
  "change",
  () => {

    state.settings.defaultTravelers =
      Number(
        defaultTravelersSelect.value
      );


    saveSettings();


    showToast(
      "기본 여행 인원이 변경되었습니다."
    );
  }
);


currencySelect.addEventListener(
  "change",
  () => {

    state.settings.currency =
      currencySelect.value;


    saveSettings();


    showToast(
      "통화 설정이 변경되었습니다."
    );
  }
);


/* =========================================================
   17. TRIP FORM
========================================================= */

function resetTripForm() {

  tripForm.reset();


  tripId.value = "";


  tripTravelers.value =
    state.settings.defaultTravelers;


  tripFormHeaderTitle.textContent =
    "새로운 여행";


  saveTripButton.textContent =
    "여행 만들기";


  tripDatePreview.textContent =
    "날짜를 선택하면 여행 기간이 표시됩니다.";


  clearTripFormErrors();
}


function openCreateTrip() {

  resetTripForm();


  showScreen(
    "trip-form"
  );
}


function openEditTrip() {

  const trip =
    getCurrentTrip();


  if (!trip) {

    return;
  }


  tripId.value =
    trip.id;

  tripTitle.value =
    trip.title;

  tripDestination.value =
    trip.destination;

  tripStartDate.value =
    trip.startDate;

  tripEndDate.value =
    trip.endDate;

  tripTravelers.value =
    trip.travelers;

  tripBudget.value =
    trip.budget || "";

  tripMemo.value =
    trip.memo;


  tripFormHeaderTitle.textContent =
    "여행 수정";


  saveTripButton.textContent =
    "수정 완료";


  updateDatePreview();


  showScreen(
    "trip-form"
  );
}


/* 오류 초기화 */

function clearTripFormErrors() {

  const errorIds = [
    "tripTitleError",
    "tripDestinationError",
    "tripDateError"
  ];


  errorIds.forEach(
    id => {

      const element =
        document.getElementById(
          id
        );


      if (element) {

        element.textContent =
          "";
      }
    }
  );
}


/* 날짜 미리보기 */

function updateDatePreview() {

  const start =
    tripStartDate.value;

  const end =
    tripEndDate.value;


  if (
    !start ||
    !end
  ) {

    tripDatePreview.textContent =
      "날짜를 선택하면 여행 기간이 표시됩니다.";

    return;
  }


  const days =
    getTripDays(
      start,
      end
    );


  if (
    days <= 0
  ) {

    tripDatePreview.textContent =
      "종료일은 출발일보다 빠를 수 없습니다.";

    return;
  }


  tripDatePreview.textContent =
    `${formatLongDate(start)} ~ ${formatLongDate(end)} · 총 ${days}일 여행`;
}


/* Validation */

function validateTripForm() {

  clearTripFormErrors();


  let valid =
    true;


  const title =
    tripTitle.value.trim();

  const destination =
    tripDestination.value.trim();

  const start =
    parseLocalDate(
      tripStartDate.value
    );

  const end =
    parseLocalDate(
      tripEndDate.value
    );

  const travelers =
    Number(
      tripTravelers.value
    );

  const budget =
    Number(
      tripBudget.value || 0
    );


  if (!title) {

    document.getElementById(
      "tripTitleError"
    ).textContent =
      "여행 제목을 입력해주세요.";


    valid = false;
  }


  if (!destination) {

    document.getElementById(
      "tripDestinationError"
    ).textContent =
      "여행지를 입력해주세요.";


    valid = false;
  }


  if (
    !start ||
    !end
  ) {

    document.getElementById(
      "tripDateError"
    ).textContent =
      "출발일과 종료일을 선택해주세요.";


    valid = false;

  } else if (
    end < start
  ) {

    document.getElementById(
      "tripDateError"
    ).textContent =
      "종료일은 출발일보다 빠를 수 없습니다.";


    valid = false;
  }


  if (
    !Number.isFinite(
      travelers
    ) ||
    travelers < 1
  ) {

    showToast(
      "여행 인원은 1명 이상이어야 합니다."
    );


    valid = false;
  }


  if (
    !Number.isFinite(
      budget
    ) ||
    budget < 0
  ) {

    showToast(
      "예산은 0 이상이어야 합니다."
    );


    valid = false;
  }


  return valid;
}


/* 저장 */

function handleTripSubmit(event) {

  event.preventDefault();


  if (
    !validateTripForm()
  ) {

    return;
  }


  const editingId =
    tripId.value;


  const tripData = {

    title:
      tripTitle.value.trim(),

    destination:
      tripDestination.value.trim(),

    startDate:
      tripStartDate.value,

    endDate:
      tripEndDate.value,

    travelers:
      Number(
        tripTravelers.value
      ),

    budget:
      Number(
        tripBudget.value || 0
      ),

    memo:
      tripMemo.value.trim()
  };


  /* 수정 */

  if (editingId) {

    const trip =
      state.trips.find(
        item =>
          item.id ===
          editingId
      );


    if (!trip) {

      showToast(
        "수정할 여행을 찾을 수 없습니다."
      );

      showScreen(
        "home"
      );

      return;
    }


    const allowedDates =
      getDateRange(
        tripData.startDate,
        tripData.endDate
      );


    const outsideSchedules =
      trip.schedules.filter(
        schedule =>
          !allowedDates.includes(
            schedule.date
          )
      );


    if (
      outsideSchedules.length > 0
    ) {

      const confirmed =
        window.confirm(
          `새 여행 기간을 벗어나는 일정 ${outsideSchedules.length}개가 삭제됩니다. 계속할까요?`
        );


      if (!confirmed) {

        return;
      }
    }


    Object.assign(
      trip,
      tripData
    );


    trip.schedules =
      trip.schedules.filter(
        schedule =>
          allowedDates.includes(
            schedule.date
          )
      );


    saveTrips();


    state.selectedDate =
      trip.startDate;


    showToast(
      "여행 정보가 수정되었습니다."
    );


    showScreen(
      "dashboard"
    );

    return;
  }


  /* 생성 */

  const newTrip = {

    id:
      createId(),

    isSample:
      false,

    ...tripData,

    schedules: [],

    expenses: [],

    checklist: []
  };


  state.trips.push(
    newTrip
  );


  state.currentTripId =
    newTrip.id;


  state.selectedDate =
    newTrip.startDate;


  saveTrips();


  showToast(
    "새로운 여행을 만들었습니다."
  );


  showScreen(
    "dashboard"
  );
}


/* =========================================================
   18. DASHBOARD
========================================================= */

function renderDashboard() {

  const trip =
    getCurrentTrip();


  if (!trip) {

    showScreen(
      "home"
    );

    return;
  }


  dashboardHeaderTitle.textContent =
    trip.title;


  renderDashboardHero(
    trip
  );

  renderDashboardSummary(
    trip
  );

  renderTravelProgress(
    trip
  );

  renderTodaySchedule(
    trip
  );

  renderDashboardBudget(
    trip
  );


  dashboardMemo.textContent =
    trip.memo ||
    "등록된 여행 메모가 없습니다.";


  const status =
    getTripStatus(
      trip
    );


  if (
    status.type ===
    "complete"
  ) {

    tripCompleteBanner.classList.remove(
      "hidden"
    );

  } else {

    tripCompleteBanner.classList.add(
      "hidden"
    );
  }


  /*
    Sample은 둘러보기 중심이므로
    삭제 버튼 숨김
  */

  if (
    trip.isSample
  ) {

    deleteTripButton.classList.add(
      "hidden"
    );

  } else {

    deleteTripButton.classList.remove(
      "hidden"
    );
  }


  refreshIcons();
}


function renderDashboardHero(trip) {

  const status =
    getTripStatus(
      trip
    );


  dashboardHero.innerHTML = `
    <span class="trip-hero-label">
      ${
        trip.isSample
          ? "SAMPLE TRIP"
          : "MY TRIP"
      }
    </span>

    <h2>
      ${escapeHTML(trip.title)}
    </h2>

    <p>
      ${escapeHTML(trip.destination)}
      ·
      ${formatLongDate(trip.startDate)}
      -
      ${formatLongDate(trip.endDate)}
      ·
      ${trip.travelers}명
    </p>

    <span class="trip-hero-dday">
      ${escapeHTML(status.text)}
    </span>
  `;
}


function renderDashboardSummary(trip) {

  const days =
    getTripDays(
      trip.startDate,
      trip.endDate
    );

  const totalExpense =
    calculateTotalExpense(
      trip
    );

  const checklist =
    calculateChecklistProgress(
      trip
    );


  dashboardSummary.innerHTML = `

    <article class="summary-card">

      <span>
        여행 기간
      </span>

      <strong>
        ${days} DAYS
      </strong>

    </article>


    <article class="summary-card">

      <span>
        전체 일정
      </span>

      <strong>
        ${trip.schedules.length}개
      </strong>

    </article>


    <article class="summary-card">

      <span>
        현재 지출
      </span>

      <strong>
        ${formatCurrency(totalExpense)}
      </strong>

    </article>


    <article class="summary-card">

      <span>
        준비 완료
      </span>

      <strong>
        ${checklist.percent}%
      </strong>

    </article>
  `;
}


/* =========================================================
   19. TRAVEL PROGRESS
========================================================= */

function renderTravelProgress(trip) {

  const status =
    getTripStatus(
      trip
    );

  const checklist =
    calculateChecklistProgress(
      trip
    );


  const scheduleReady =
    trip.schedules.length > 0;


  const checklistReady =
    checklist.percent >= 80;


  const steps = [

    {
      title: "여행 생성",
      completed: true
    },

    {
      title: "일정 작성",
      completed:
        scheduleReady
    },

    {
      title: "준비",
      completed:
        checklistReady
    },

    {
      title: "출발",
      completed:
        status.type === "active" ||
        status.type === "complete"
    }
  ];


  travelProgressStep.innerHTML =
    steps
      .map(
        (step, index) => {

          let className =
            "travel-step-item";


          if (
            step.completed
          ) {

            className +=
              " completed";

          } else {

            const previousCompleted =
              index === 0 ||
              steps
                .slice(
                  0,
                  index
                )
                .every(
                  item =>
                    item.completed
                );


            if (
              previousCompleted
            ) {

              className +=
                " current";
            }
          }


          return `
            <div class="${className}">

              <div class="travel-step-dot">
                ${
                  step.completed
                    ? "✓"
                    : index + 1
                }
              </div>

              <span>
                ${step.title}
              </span>

            </div>
          `;
        }
      )
      .join("");
}


/* =========================================================
   20. TODAY / NEXT SCHEDULE
========================================================= */

function sortSchedules(
  schedules
) {

  return [...schedules]
    .sort(
      (a, b) =>
        `${a.date} ${a.time}`
          .localeCompare(
            `${b.date} ${b.time}`
          )
    );
}


function renderTodaySchedule(trip) {

  const today =
    getTodayISO();

  const dates =
    getDateRange(
      trip.startDate,
      trip.endDate
    );


  let targetDate =
    today;


  /*
    여행 전이면 첫날 일정
    여행 완료면 마지막날 일정
  */

  if (
    today < trip.startDate
  ) {

    targetDate =
      trip.startDate;

    todayScheduleHeading.textContent =
      "첫 일정";

  } else if (
    today > trip.endDate
  ) {

    targetDate =
      trip.endDate;

    todayScheduleHeading.textContent =
      "마지막 일정";

  } else {

    const dayIndex =
      dates.indexOf(
        today
      ) + 1;


    todayScheduleHeading.textContent =
      `오늘은 DAY ${dayIndex}`;
  }


  const schedules =
    sortSchedules(
      trip.schedules.filter(
        item =>
          item.date ===
          targetDate
      )
    );


  if (
    schedules.length === 0
  ) {

    todayScheduleList.innerHTML = `
      <div class="empty-state">

        <div class="empty-state-icon">
          <i data-lucide="calendar"></i>
        </div>

        <h3>
          등록된 일정이 없습니다.
        </h3>

      </div>
    `;

  } else {

    todayScheduleList.innerHTML =
      schedules
        .slice(
          0,
          4
        )
        .map(
          item => `
            <div class="today-schedule-item">

              <div class="today-schedule-time">
                ${escapeHTML(item.time)}
              </div>

              <div>

                <h3>
                  ${escapeHTML(item.title)}
                </h3>

                <p>
                  ${escapeHTML(item.category)}
                  ${
                    item.location
                      ? ` · ${escapeHTML(item.location)}`
                      : ""
                  }
                </p>

              </div>

            </div>
          `
        )
        .join("");
  }


  renderNextSchedule(
    trip
  );
}


function renderNextSchedule(trip) {

  const now =
    new Date();

  const today =
    getTodayISO();


  const schedules =
    sortSchedules(
      trip.schedules
    );


  let next = null;


  for (
    const item of schedules
  ) {

    if (
      item.date > today
    ) {

      next = item;

      break;
    }


    if (
      item.date === today
    ) {

      const [
        hour,
        minute
      ] =
        item.time
          .split(":")
          .map(Number);


      const itemDate =
        parseLocalDate(
          item.date
        );


      itemDate.setHours(
        hour,
        minute,
        0,
        0
      );


      if (
        itemDate >= now
      ) {

        next = item;

        break;
      }
    }
  }


  if (
    !next
  ) {

    nextScheduleCard.innerHTML = `
      <span class="next-schedule-label">
        NEXT
      </span>

      <h3>
        다음 일정이 없습니다.
      </h3>
    `;

    return;
  }


  nextScheduleCard.innerHTML = `
    <span class="next-schedule-label">
      NEXT
    </span>

    <h3>
      ${escapeHTML(next.title)}
    </h3>

    <p>
      ${formatShortDate(next.date)}
      ${escapeHTML(next.time)}
      ${
        next.location
          ? ` · ${escapeHTML(next.location)}`
          : ""
      }
    </p>
  `;
}


/* =========================================================
   21. DASHBOARD BUDGET
========================================================= */

function renderDashboardBudget(trip) {

  const spent =
    calculateTotalExpense(
      trip
    );


  const budget =
    Number(
      trip.budget || 0
    );


  const percent =
    budget > 0
      ? Math.round(
          spent /
          budget *
          100
        )
      : 0;


  dashboardBudget.innerHTML = `
    <div class="budget-inline-info">

      <strong>
        ${formatCurrency(spent)}
      </strong>

      <span>
        ${
          budget > 0
            ? `/ ${formatCurrency(budget)}`
            : "예산 미설정"
        }
      </span>

    </div>

    <div class="progress-track">

      <div
        class="progress-bar"
        style="width:${Math.min(percent, 100)}%"
      ></div>

    </div>
  `;
}


/* =========================================================
   22. ITINERARY
========================================================= */

function renderItinerary() {

  const trip =
    getCurrentTrip();


  if (!trip) {

    return;
  }


  const dates =
    getDateRange(
      trip.startDate,
      trip.endDate
    );


  if (
    !state.selectedDate ||
    !dates.includes(
      state.selectedDate
    )
  ) {

    state.selectedDate =
      dates[0];
  }


  renderDayTabs(
    dates
  );


  const index =
    dates.indexOf(
      state.selectedDate
    );


  selectedDayTitle.textContent =
    `DAY ${index + 1} · ${formatShortDate(state.selectedDate)}`;


  const schedules =
    sortSchedules(
      trip.schedules.filter(
        item =>
          item.date ===
          state.selectedDate
      )
    );


  if (
    schedules.length === 0
  ) {

    scheduleTimeline.innerHTML =
      "";

    scheduleEmptyState.classList.remove(
      "hidden"
    );

  } else {

    scheduleEmptyState.classList.add(
      "hidden"
    );


    scheduleTimeline.innerHTML =
      schedules
        .map(
          schedule =>
            createScheduleHTML(
              schedule
            )
        )
        .join("");
  }


  refreshIcons();
}


function renderDayTabs(dates) {

  dayTabList.innerHTML =
    dates
      .map(
        (date, index) => `
          <button
            type="button"
            class="day-tab ${
              date ===
              state.selectedDate
                ? "active"
                : ""
            }"
            data-day-date="${date}"
          >

            <strong>
              DAY ${index + 1}
            </strong>

            <span>
              ${formatShortDate(date)}
            </span>

          </button>
        `
      )
      .join("");
}


function getCategoryClass(
  category
) {

  const categories = {

    관광:
      "category-tour",

    음식:
      "category-food",

    카페:
      "category-cafe",

    숙소:
      "category-hotel",

    교통:
      "category-transport",

    쇼핑:
      "category-shopping",

    기타:
      "category-etc"
  };


  return (
    categories[category] ||
    "category-etc"
  );
}


function createScheduleHTML(
  item
) {

  return `
    <article
      class="
        schedule-card
        ${getCategoryClass(item.category)}
      "
    >

      <div class="schedule-time">
        ${escapeHTML(item.time)}
      </div>


      <div class="schedule-info">

        <h3>
          ${escapeHTML(item.title)}
        </h3>


        <div class="schedule-meta">

          <span class="category-chip">
            ${escapeHTML(item.category)}
          </span>

          ${
            Number(item.cost) > 0
              ? `
                <span class="info-chip">
                  ${formatCurrency(item.cost)}
                </span>
              `
              : ""
          }

        </div>


        ${
          item.location
            ? `
              <p class="schedule-location">
                📍
                ${escapeHTML(item.location)}
              </p>
            `
            : ""
        }


        ${
          item.memo
            ? `
              <p class="schedule-memo">
                ${escapeHTML(item.memo)}
              </p>
            `
            : ""
        }

      </div>


      <div class="schedule-actions">

        <button
          type="button"
          class="icon-mini-button"
          data-edit-schedule="${item.id}"
          aria-label="일정 수정"
        >

          <i data-lucide="pencil"></i>

        </button>


        <button
          type="button"
          class="icon-mini-button danger"
          data-delete-schedule="${item.id}"
          aria-label="일정 삭제"
        >

          <i data-lucide="trash-2"></i>

        </button>

      </div>

    </article>
  `;
}


/* =========================================================
   23. SCHEDULE MODAL
========================================================= */

function openScheduleModal(
  scheduleIdValue = null
) {

  const trip =
    getCurrentTrip();


  if (!trip) {

    return;
  }


  scheduleForm.reset();


  scheduleId.value =
    "";


  scheduleDate.min =
    trip.startDate;

  scheduleDate.max =
    trip.endDate;


  scheduleDate.value =
    state.selectedDate ||
    trip.startDate;


  scheduleTime.value =
    "09:00";


  scheduleCost.value =
    "";


  if (
    scheduleIdValue
  ) {

    const item =
      trip.schedules.find(
        schedule =>
          schedule.id ===
          scheduleIdValue
      );


    if (!item) {

      return;
    }


    scheduleId.value =
      item.id;

    scheduleDate.value =
      item.date;

    scheduleTime.value =
      item.time;

    scheduleTitle.value =
      item.title;

    scheduleCategory.value =
      item.category;

    scheduleLocation.value =
      item.location || "";

    scheduleCost.value =
      item.cost || "";

    scheduleMemo.value =
      item.memo || "";


    scheduleModalTitle.textContent =
      "일정 수정";


    saveScheduleButton.textContent =
      "수정 완료";

  } else {

    scheduleModalTitle.textContent =
      "일정 추가";


    saveScheduleButton.textContent =
      "일정 추가";
  }


  openModal(
    scheduleModal
  );
}


function handleScheduleSubmit(
  event
) {

  event.preventDefault();


  const trip =
    getCurrentTrip();


  if (!trip) {

    return;
  }


  const date =
    scheduleDate.value;

  const time =
    scheduleTime.value;

  const title =
    scheduleTitle.value.trim();

  const category =
    scheduleCategory.value;

  const location =
    scheduleLocation.value.trim();

  const cost =
    Number(
      scheduleCost.value || 0
    );

  const memo =
    scheduleMemo.value.trim();


  if (
    !date ||
    !time ||
    !title
  ) {

    showToast(
      "날짜, 시간, 일정명을 입력해주세요."
    );

    return;
  }


  const allowed =
    getDateRange(
      trip.startDate,
      trip.endDate
    );


  if (
    !allowed.includes(
      date
    )
  ) {

    showToast(
      "여행 기간 안의 날짜를 선택해주세요."
    );

    return;
  }


  if (
    cost < 0
  ) {

    showToast(
      "비용은 0 이상이어야 합니다."
    );

    return;
  }


  const editingId =
    scheduleId.value;


  /* 같은 시간 일정 */

  const duplicated =
    trip.schedules.find(
      item =>
        item.date === date &&
        item.time === time &&
        item.id !== editingId
    );


  if (duplicated) {

    const confirmed =
      window.confirm(
        `"${duplicated.title}" 일정과 시간이 겹칩니다. 그래도 저장할까요?`
      );


    if (!confirmed) {

      return;
    }
  }


  const data = {

    date,

    time,

    title,

    category,

    location,

    cost,

    memo
  };


  if (
    editingId
  ) {

    const item =
      trip.schedules.find(
        schedule =>
          schedule.id ===
          editingId
      );


    if (item) {

      Object.assign(
        item,
        data
      );
    }


    showToast(
      "일정이 수정되었습니다."
    );

  } else {

    trip.schedules.push({

      id:
        createId(),

      ...data
    });


    showToast(
      "일정이 추가되었습니다."
    );
  }


  state.selectedDate =
    date;


  saveTrips();


  closeModal(
    scheduleModal
  );


  renderItinerary();
}


function deleteSchedule(
  scheduleIdValue
) {

  const trip =
    getCurrentTrip();


  if (!trip) {

    return;
  }


  const schedule =
    trip.schedules.find(
      item =>
        item.id ===
        scheduleIdValue
    );


  if (!schedule) {

    return;
  }


  openConfirm({

    title:
      "일정 삭제",

    message:
      `"${schedule.title}" 일정을 삭제하시겠습니까?`,

    actionText:
      "삭제",

    callback:
      () => {

        trip.schedules =
          trip.schedules.filter(
            item =>
              item.id !==
              scheduleIdValue
          );


        saveTrips();

        renderItinerary();


        showToast(
          "일정이 삭제되었습니다."
        );
      }
  });
}


/* =========================================================
   24. BUDGET
========================================================= */

function renderBudget() {

  const trip =
    getCurrentTrip();


  if (!trip) {

    return;
  }


  const spent =
    calculateTotalExpense(
      trip
    );

  const budget =
    Number(
      trip.budget || 0
    );

  const remain =
    budget -
    spent;


  budgetSummaryCard.innerHTML = `
    <span class="section-label">
      BUDGET
    </span>

    <h2>
      여행 예산
    </h2>


    <div class="budget-total">

      <span>
        전체 예산
      </span>

      <strong>
        ${formatCurrency(budget)}
      </strong>

    </div>


    <div class="budget-summary-grid">

      <div class="budget-summary-item">

        <span>
          현재 지출
        </span>

        <strong>
          ${formatCurrency(spent)}
        </strong>

      </div>


      <div
        class="
          budget-summary-item
          ${remain < 0 ? "over" : ""}
        "
      >

        <span>
          ${
            remain < 0
              ? "초과 금액"
              : "남은 예산"
          }
        </span>

        <strong>
          ${formatCurrency(Math.abs(remain))}
        </strong>

      </div>

    </div>
  `;


  renderBudgetProgress(
    budget,
    spent
  );


  renderBudgetCategories(
    trip
  );


  renderExpenses(
    trip
  );


  refreshIcons();
}


function renderBudgetProgress(
  budget,
  spent
) {

  const percent =
    budget > 0
      ? Math.round(
          spent /
          budget *
          100
        )
      : 0;


  budgetProgressPercent.textContent =
    `${percent}%`;


  budgetProgressBar.style.width =
    `${Math.min(percent, 100)}%`;


  budgetProgressBar.className =
    "progress-bar";


  let message =
    "아직 사용한 예산이 없습니다.";


  if (
    budget <= 0
  ) {

    message =
      "전체 예산을 먼저 설정해주세요.";

  } else if (
    percent <= 60
  ) {

    budgetProgressBar.classList.add(
      "success"
    );

    message =
      "예산에 여유가 있습니다.";

  } else if (
    percent <= 85
  ) {

    budgetProgressBar.classList.add(
      "warning"
    );

    message =
      "예산 사용량을 확인해보세요.";

  } else if (
    percent <= 100
  ) {

    budgetProgressBar.classList.add(
      "warning"
    );

    message =
      "예산 한도에 가까워졌습니다.";

  } else {

    budgetProgressBar.classList.add(
      "danger"
    );

    message =
      "예산을 초과했습니다.";
  }


  budgetProgressMessage.textContent =
    message;
}


/* 카테고리별 금액 */

function renderBudgetCategories(
  trip
) {

  if (
    trip.expenses.length === 0
  ) {

    budgetCategoryList.innerHTML = `
      <p class="progress-message">
        아직 지출 데이터가 없습니다.
      </p>
    `;

    return;
  }


  const totals = {};


  trip.expenses.forEach(
    expense => {

      const category =
        expense.category ||
        "기타";


      totals[category] =
        (
          totals[category] ||
          0
        ) +
        Number(
          expense.amount || 0
        );
    }
  );


  const max =
    Math.max(
      ...Object.values(
        totals
      )
    );


  budgetCategoryList.innerHTML =
    Object
      .entries(
        totals
      )
      .sort(
        (a, b) =>
          b[1] -
          a[1]
      )
      .map(
        ([category, amount]) => {

          const percent =
            max > 0
              ? amount /
                max *
                100
              : 0;


          return `
            <div class="budget-category-item">

              <span>
                ${escapeHTML(category)}
              </span>

              <div class="category-progress-track">

                <div
                  class="category-progress-bar"
                  style="width:${percent}%"
                ></div>

              </div>

              <strong>
                ${formatCurrency(amount)}
              </strong>

            </div>
          `;
        }
      )
      .join("");
}


/* =========================================================
   25. EXPENSE CRUD
========================================================= */

function renderExpenses(
  trip
) {

  if (
    trip.expenses.length === 0
  ) {

    expenseList.innerHTML =
      "";

    expenseEmptyState.classList.remove(
      "hidden"
    );

    return;
  }


  expenseEmptyState.classList.add(
    "hidden"
  );


  const expenses =
    [...trip.expenses]
      .sort(
        (a, b) =>
          b.date.localeCompare(
            a.date
          )
      );


  expenseList.innerHTML =
    expenses
      .map(
        item => `
          <article class="expense-card">

            <div>

              <h3>
                ${escapeHTML(item.title)}
              </h3>

              <p>
                ${formatShortDate(item.date)}
                ·
                ${escapeHTML(item.category)}
              </p>

            </div>


            <div class="expense-card-right">

              <strong>
                ${formatCurrency(item.amount)}
              </strong>


              <div class="expense-card-actions">

                <button
                  type="button"
                  class="icon-mini-button"
                  data-edit-expense="${item.id}"
                >

                  <i data-lucide="pencil"></i>

                </button>


                <button
                  type="button"
                  class="icon-mini-button danger"
                  data-delete-expense="${item.id}"
                >

                  <i data-lucide="trash-2"></i>

                </button>

              </div>

            </div>

          </article>
        `
      )
      .join("");
}


function openExpenseModal(
  expenseIdValue = null
) {

  const trip =
    getCurrentTrip();


  if (!trip) {

    return;
  }


  expenseForm.reset();


  expenseId.value =
    "";


  expenseDate.value =
    state.selectedDate ||
    trip.startDate;


  if (
    expenseIdValue
  ) {

    const item =
      trip.expenses.find(
        expense =>
          expense.id ===
          expenseIdValue
      );


    if (!item) {

      return;
    }


    expenseId.value =
      item.id;

    expenseDate.value =
      item.date;

    expenseTitle.value =
      item.title;

    expenseCategory.value =
      item.category;

    expenseAmount.value =
      item.amount;


    expenseModalTitle.textContent =
      "지출 수정";


    saveExpenseButton.textContent =
      "수정 완료";

  } else {

    expenseModalTitle.textContent =
      "지출 추가";


    saveExpenseButton.textContent =
      "지출 추가";
  }


  openModal(
    expenseModal
  );
}


function handleExpenseSubmit(
  event
) {

  event.preventDefault();


  const trip =
    getCurrentTrip();


  if (!trip) {

    return;
  }


  const date =
    expenseDate.value;

  const title =
    expenseTitle.value.trim();

  const category =
    expenseCategory.value;

  const amount =
    Number(
      expenseAmount.value
    );


  if (
    !date ||
    !title
  ) {

    showToast(
      "날짜와 지출 항목을 입력해주세요."
    );

    return;
  }


  if (
    !Number.isFinite(
      amount
    ) ||
    amount < 0
  ) {

    showToast(
      "금액은 0 이상이어야 합니다."
    );

    return;
  }


  const editingId =
    expenseId.value;


  const data = {

    date,

    title,

    category,

    amount
  };


  if (
    editingId
  ) {

    const item =
      trip.expenses.find(
        expense =>
          expense.id ===
          editingId
      );


    if (item) {

      Object.assign(
        item,
        data
      );
    }


    showToast(
      "지출 내역이 수정되었습니다."
    );

  } else {

    trip.expenses.push({

      id:
        createId(),

      ...data
    });


    showToast(
      "지출 내역이 추가되었습니다."
    );
  }


  saveTrips();


  closeModal(
    expenseModal
  );


  renderBudget();
}


function deleteExpense(
  expenseIdValue
) {

  const trip =
    getCurrentTrip();


  if (!trip) {

    return;
  }


  const expense =
    trip.expenses.find(
      item =>
        item.id ===
        expenseIdValue
    );


  if (!expense) {

    return;
  }


  openConfirm({

    title:
      "지출 삭제",

    message:
      `"${expense.title}" 지출을 삭제하시겠습니까?`,

    actionText:
      "삭제",

    callback:
      () => {

        trip.expenses =
          trip.expenses.filter(
            item =>
              item.id !==
              expenseIdValue
          );


        saveTrips();

        renderBudget();


        showToast(
          "지출이 삭제되었습니다."
        );
      }
  });
}


/* =========================================================
   26. CHECKLIST
========================================================= */

function renderChecklist() {

  const trip =
    getCurrentTrip();


  if (!trip) {

    return;
  }


  const progress =
    calculateChecklistProgress(
      trip
    );


  checkProgressPercent.textContent =
    `${progress.percent}%`;


  checkProgressBar.style.width =
    `${progress.percent}%`;


  checkProgressBar.className =
    "progress-bar success";


  if (
    progress.total === 0
  ) {

    checkProgressDescription.textContent =
      "준비물을 추가해보세요.";

  } else {

    checkProgressDescription.textContent =
      `${progress.completed} / ${progress.total}개 준비 완료`;
  }


  if (
    trip.checklist.length === 0
  ) {

    checklistList.innerHTML =
      "";

    checklistEmptyState.classList.remove(
      "hidden"
    );

    return;
  }


  checklistEmptyState.classList.add(
    "hidden"
  );


  checklistList.innerHTML =
    trip.checklist
      .map(
        item => `
          <div
            class="
              checklist-item
              ${
                item.completed
                  ? "completed"
                  : ""
              }
            "
          >

            <input
              type="checkbox"
              id="check-${item.id}"
              data-toggle-check="${item.id}"
              ${
                item.completed
                  ? "checked"
                  : ""
              }
            >


            <label
              for="check-${item.id}"
            >
              ${escapeHTML(item.title)}
            </label>


            <button
              type="button"
              class="icon-mini-button danger"
              data-delete-check="${item.id}"
              aria-label="준비물 삭제"
            >

              <i data-lucide="trash-2"></i>

            </button>

          </div>
        `
      )
      .join("");


  refreshIcons();
}


function openChecklistModal() {

  checklistForm.reset();


  openModal(
    checklistModal
  );
}


function handleChecklistSubmit(
  event
) {

  event.preventDefault();


  const trip =
    getCurrentTrip();


  if (!trip) {

    return;
  }


  const title =
    checklistTitle.value.trim();


  if (!title) {

    showToast(
      "준비물 이름을 입력해주세요."
    );

    return;
  }


  trip.checklist.push({

    id:
      createId(),

    title,

    completed:
      false
  });


  saveTrips();


  closeModal(
    checklistModal
  );


  renderChecklist();


  showToast(
    "준비물이 추가되었습니다."
  );
}


function toggleChecklist(
  id,
  checked
) {

  const trip =
    getCurrentTrip();


  if (!trip) {

    return;
  }


  const item =
    trip.checklist.find(
      check =>
        check.id === id
    );


  if (!item) {

    return;
  }


  item.completed =
    checked;


  saveTrips();


  renderChecklist();
}


function deleteChecklist(
  id
) {

  const trip =
    getCurrentTrip();


  if (!trip) {

    return;
  }


  const item =
    trip.checklist.find(
      check =>
        check.id === id
    );


  if (!item) {

    return;
  }


  openConfirm({

    title:
      "준비물 삭제",

    message:
      `"${item.title}" 항목을 삭제하시겠습니까?`,

    actionText:
      "삭제",

    callback:
      () => {

        trip.checklist =
          trip.checklist.filter(
            check =>
              check.id !== id
          );


        saveTrips();

        renderChecklist();


        showToast(
          "준비물이 삭제되었습니다."
        );
      }
  });
}


/* =========================================================
   27. TRIP COMPLETE
========================================================= */

function renderTripComplete() {

  const trip =
    getCurrentTrip();


  if (!trip) {

    return;
  }


  const days =
    getTripDays(
      trip.startDate,
      trip.endDate
    );

  const expense =
    calculateTotalExpense(
      trip
    );

  const progress =
    calculateChecklistProgress(
      trip
    );


  completeTripTitle.textContent =
    `${trip.title} 완료!`;


  completeSummaryGrid.innerHTML = `

    <article class="complete-summary-card">

      <span>
        여행 기간
      </span>

      <strong>
        ${days} DAYS
      </strong>

    </article>


    <article class="complete-summary-card">

      <span>
        전체 일정
      </span>

      <strong>
        ${trip.schedules.length}개
      </strong>

    </article>


    <article class="complete-summary-card">

      <span>
        총 지출
      </span>

      <strong>
        ${formatCurrency(expense)}
      </strong>

    </article>


    <article class="complete-summary-card">

      <span>
        준비 완료율
      </span>

      <strong>
        ${progress.percent}%
      </strong>

    </article>
  `;
}


/* =========================================================
   28. DELETE TRIP
========================================================= */

function deleteCurrentTrip() {

  const trip =
    getCurrentTrip();


  if (
    !trip ||
    trip.isSample
  ) {

    return;
  }


  openConfirm({

    title:
      "여행 삭제",

    message:
      `"${trip.title}" 여행을 삭제하시겠습니까?`,

    actionText:
      "삭제",

    callback:
      () => {

        state.trips =
          state.trips.filter(
            item =>
              item.id !==
              trip.id
          );


        state.currentTripId =
          null;


        state.selectedDate =
          null;


        saveTrips();


        showScreen(
          "home"
        );


        showToast(
          "여행이 삭제되었습니다."
        );
      }
  });
}


/* =========================================================
   29. MODAL
========================================================= */

function openModal(
  modal
) {

  modal.classList.remove(
    "hidden"
  );


  document.body.style.overflow =
    "hidden";


  refreshIcons();
}


function closeModal(
  modal
) {

  modal.classList.add(
    "hidden"
  );


  document.body.style.overflow =
    "";
}


/* =========================================================
   30. CONFIRM
========================================================= */

function openConfirm({
  title,
  message,
  actionText = "확인",
  callback
}) {

  confirmModalTitle.textContent =
    title;


  confirmModalMessage.textContent =
    message;


  confirmActionButton.textContent =
    actionText;


  state.confirmAction =
    callback;


  openModal(
    confirmModal
  );
}


/* =========================================================
   31. TOAST
========================================================= */

let toastTimer = null;


function showToast(message) {

  clearTimeout(
    toastTimer
  );


  toast.textContent =
    message;


  toast.classList.remove(
    "hidden"
  );


  toastTimer =
    setTimeout(
      () => {

        toast.classList.add(
          "hidden"
        );

      },
      2200
    );
}


/* =========================================================
   32. HOME EVENT
========================================================= */

settingsButton.addEventListener(
  "click",
  () => {

    showScreen(
      "settings"
    );
  }
);


newTripButton.addEventListener(
  "click",
  openCreateTrip
);


document.addEventListener(
  "click",
  event => {

    const tripButton =
      event.target.closest(
        "[data-open-trip]"
      );


    if (
      tripButton
    ) {

      openTrip(
        tripButton.dataset.openTrip
      );
    }
  }
);


/* =========================================================
   33. BACK BUTTON
========================================================= */

document.addEventListener(
  "click",
  event => {

    const backButton =
      event.target.closest(
        "[data-back]"
      );


    if (!backButton) {

      return;
    }


    const target =
      backButton.dataset.back;


    showScreen(
      target
    );
  }
);


tripFormBackButton.addEventListener(
  "click",
  () => {

    if (
      state.currentTripId
    ) {

      showScreen(
        "dashboard"
      );

    } else {

      showScreen(
        "home"
      );
    }
  }
);


/* =========================================================
   34. TRIP EVENT
========================================================= */

tripForm.addEventListener(
  "submit",
  handleTripSubmit
);


tripStartDate.addEventListener(
  "change",
  updateDatePreview
);


tripEndDate.addEventListener(
  "change",
  updateDatePreview
);


editTripButton.addEventListener(
  "click",
  openEditTrip
);


deleteTripButton.addEventListener(
  "click",
  deleteCurrentTrip
);


/* =========================================================
   35. BOTTOM NAVIGATION
========================================================= */

document.addEventListener(
  "click",
  event => {

    const nav =
      event.target.closest(
        "[data-nav]"
      );


    if (!nav) {

      return;
    }


    const target =
      nav.dataset.nav;


    showScreen(
      target
    );
  }
);


viewAllScheduleButton.addEventListener(
  "click",
  () => {

    showScreen(
      "itinerary"
    );
  }
);


dashboardBudgetButton.addEventListener(
  "click",
  () => {

    showScreen(
      "budget"
    );
  }
);


/* =========================================================
   36. DAY TAB EVENT
========================================================= */

dayTabList.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        "[data-day-date]"
      );


    if (!button) {

      return;
    }


    state.selectedDate =
      button.dataset.dayDate;


    renderItinerary();
  }
);


/* =========================================================
   37. SCHEDULE EVENT
========================================================= */

addScheduleButton.addEventListener(
  "click",
  () => {

    openScheduleModal();
  }
);


scheduleForm.addEventListener(
  "submit",
  handleScheduleSubmit
);


scheduleTimeline.addEventListener(
  "click",
  event => {

    const editButton =
      event.target.closest(
        "[data-edit-schedule]"
      );


    if (editButton) {

      openScheduleModal(
        editButton.dataset.editSchedule
      );

      return;
    }


    const deleteButton =
      event.target.closest(
        "[data-delete-schedule]"
      );


    if (deleteButton) {

      deleteSchedule(
        deleteButton.dataset.deleteSchedule
      );
    }
  }
);


/* =========================================================
   38. EXPENSE EVENT
========================================================= */

addExpenseButton.addEventListener(
  "click",
  () => {

    openExpenseModal();
  }
);


expenseForm.addEventListener(
  "submit",
  handleExpenseSubmit
);


expenseList.addEventListener(
  "click",
  event => {

    const edit =
      event.target.closest(
        "[data-edit-expense]"
      );


    if (edit) {

      openExpenseModal(
        edit.dataset.editExpense
      );

      return;
    }


    const remove =
      event.target.closest(
        "[data-delete-expense]"
      );


    if (remove) {

      deleteExpense(
        remove.dataset.deleteExpense
      );
    }
  }
);


/* =========================================================
   39. CHECKLIST EVENT
========================================================= */

addChecklistButton.addEventListener(
  "click",
  openChecklistModal
);


checklistForm.addEventListener(
  "submit",
  handleChecklistSubmit
);


checklistList.addEventListener(
  "change",
  event => {

    const checkbox =
      event.target.closest(
        "[data-toggle-check]"
      );


    if (!checkbox) {

      return;
    }


    toggleChecklist(
      checkbox.dataset.toggleCheck,
      checkbox.checked
    );
  }
);


checklistList.addEventListener(
  "click",
  event => {

    const remove =
      event.target.closest(
        "[data-delete-check]"
      );


    if (!remove) {

      return;
    }


    deleteChecklist(
      remove.dataset.deleteCheck
    );
  }
);


/* =========================================================
   40. MODAL CLOSE EVENT
========================================================= */

document.addEventListener(
  "click",
  event => {

    const closeButton =
      event.target.closest(
        "[data-close-modal]"
      );


    if (!closeButton) {

      return;
    }


    const modal =
      document.getElementById(
        closeButton.dataset.closeModal
      );


    if (modal) {

      closeModal(
        modal
      );
    }
  }
);


/* 바깥 영역 클릭 */

[
  scheduleModal,
  expenseModal,
  checklistModal,
  confirmModal
].forEach(
  modal => {

    modal.addEventListener(
      "click",
      event => {

        if (
          event.target === modal
        ) {

          closeModal(
            modal
          );
        }
      }
    );
  }
);


/* ESC */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key !==
      "Escape"
    ) {

      return;
    }


    [
      scheduleModal,
      expenseModal,
      checklistModal,
      confirmModal
    ].forEach(
      modal => {

        if (
          !modal.classList.contains(
            "hidden"
          )
        ) {

          closeModal(
            modal
          );
        }
      }
    );
  }
);


/* =========================================================
   41. CONFIRM EVENT
========================================================= */

confirmCancelButton.addEventListener(
  "click",
  () => {

    closeModal(
      confirmModal
    );


    state.confirmAction =
      null;
  }
);


confirmActionButton.addEventListener(
  "click",
  () => {

    if (
      typeof
      state.confirmAction ===
      "function"
    ) {

      state.confirmAction();
    }


    state.confirmAction =
      null;


    closeModal(
      confirmModal
    );
  }
);


/* =========================================================
   42. SETTINGS ACTION
========================================================= */

restoreSampleButton.addEventListener(
  "click",
  restoreSampleTrip
);


resetAllDataButton.addEventListener(
  "click",
  () => {

    openConfirm({

      title:
        "전체 데이터 초기화",

      message:
        "사용자가 만든 모든 여행과 샘플 여행이 삭제됩니다. 계속하시겠습니까?",

      actionText:
        "전체 삭제",

      callback:
        () => {

          state.trips =
            [];


          /*
            샘플 역시 삭제되지만
            다시 자동 생성되지는 않도록 유지
          */

          state.settings.sampleInitialized =
            true;


          state.currentTripId =
            null;


          state.selectedDate =
            null;


          saveTrips();

          saveSettings();


          renderHome();


          showToast(
            "모든 여행 데이터가 삭제되었습니다."
          );
        }
    });
  }
);


/* =========================================================
   43. COMPLETE EVENT
========================================================= */

viewTripCompleteButton.addEventListener(
  "click",
  () => {

    showScreen(
      "trip-complete"
    );
  }
);


completeHomeButton.addEventListener(
  "click",
  () => {

    showScreen(
      "home"
    );
  }
);


/* =========================================================
   44. APP INIT
========================================================= */

function init() {

  /*
    1. LocalStorage
  */

  loadData();


  /*
    2. 최초 실행 Sample
  */

  initializeSampleTrip();


  /*
    3. Setting Select 반영
  */

  renderSettings();


  /*
    4. Lucide
  */

  refreshIcons();


  /*
    5. Splash
  */

  startSplash();


  /*
    개발 중 데이터 확인용
  */

  console.log(
    "Trip Planner Ver.2",
    {
      trips:
        state.trips,

      settings:
        state.settings
    }
  );
}


/* DOM 완료 후 실행 */

document.addEventListener(
  "DOMContentLoaded",
  init
);