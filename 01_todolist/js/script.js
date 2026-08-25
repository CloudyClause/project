"use strict";

/* ========================================
   Todo Focus
   STEP 4.5 - Final UI Consistency Update

   기능
   - Todo CRUD
   - Memo
   - Category / Filter
   - Priority
   - Date / Time
   - Focus
   - Progress
   - LocalStorage
   - Calendar
   - Completed / Restore
   - Statistics

   이번 수정
   - 일정 완료 상태 사각 Checkbox 통일
   - Bottom Navigation 가독성 개선
======================================== */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    /* ========================================
       01. Constant
    ======================================== */

    const STORAGE_KEY =
      "todoFocusTodos";


    /* ========================================
       02. DOM
    ======================================== */

    const currentDateElement =
      document.querySelector(
        "#current-date"
      );

    const pageElements =
      document.querySelectorAll(
        "[data-page]"
      );

    const navigationButtons =
      document.querySelectorAll(
        "[data-target-page]"
      );


    /* Modal */
    const todoModal =
      document.querySelector(
        "#todo-modal"
      );

    const openModalButtons =
      document.querySelectorAll(
        "[data-open-todo-modal]"
      );

    const closeModalButtons =
      document.querySelectorAll(
        "[data-close-todo-modal]"
      );

    const todoForm =
      document.querySelector(
        "#todo-form"
      );

    const todoModalTitle =
      document.querySelector(
        "#todo-modal-title"
      );

    const todoSubmitButton =
      document.querySelector(
        "#todo-submit-button"
      );


    /* Form */
    const todoTitleInput =
      document.querySelector(
        "#todo-title-input"
      );

    const todoMemoInput =
      document.querySelector(
        "#todo-memo-input"
      );

    const todoDateInput =
      document.querySelector(
        "#todo-date-input"
      );

    const todoTimeInput =
      document.querySelector(
        "#todo-time-input"
      );

    const todoCategoryInput =
      document.querySelector(
        "#todo-category-input"
      );


    /* Today */
    const todayTodoList =
      document.querySelector(
        "#today-todo-list"
      );

    const todayEmptyState =
      document.querySelector(
        "#today-empty-state"
      );


    /* Focus */
    const focusList =
      document.querySelector(
        "#focus-list"
      );

    const focusCount =
      document.querySelector(
        "#focus-count"
      );

    const focusEmptyState =
      document.querySelector(
        "#focus-empty-state"
      );


    /* Progress */
    const progressPercent =
      document.querySelector(
        "#progress-percent"
      );

    const progressCount =
      document.querySelector(
        "#progress-count"
      );

    const progressRemaining =
      document.querySelector(
        "#progress-remaining"
      );

    const progressTrack =
      document.querySelector(
        "#progress-track"
      );

    const progressBar =
      document.querySelector(
        "#progress-bar"
      );

    const progressBottomPercent =
      document.querySelector(
        "#progress-bottom-percent"
      );


    /* Filter */
    const statusFilterButtons =
      document.querySelectorAll(
        "[data-status-filter]"
      );

    const categoryFilterButtons =
      document.querySelectorAll(
        "[data-category-filter]"
      );


    /* Calendar */
    const calendarGrid =
      document.querySelector(
        "#calendar-grid"
      );

    const calendarCurrentMonth =
      document.querySelector(
        "#calendar-current-month"
      );

    const calendarPrevButton =
      document.querySelector(
        "#calendar-prev-button"
      );

    const calendarNextButton =
      document.querySelector(
        "#calendar-next-button"
      );

    const selectedDateTitle =
      document.querySelector(
        "#selected-date-title"
      );

    const selectedDateTodoList =
      document.querySelector(
        "#selected-date-todo-list"
      );

    const selectedDateEmptyState =
      document.querySelector(
        "#selected-date-empty-state"
      );


    /* Completed */
    const completedList =
      document.querySelector(
        "#completed-list"
      );

    const completedCount =
      document.querySelector(
        "#completed-count"
      );

    const completedEmptyState =
      document.querySelector(
        "#completed-empty-state"
      );


    /* Record Tab */
    const recordTabButtons =
      document.querySelectorAll(
        "[data-record-tab]"
      );

    const recordPanels =
      document.querySelectorAll(
        "[data-record-panel]"
      );


    /* Statistics */
    const statisticsPrevMonth =
      document.querySelector(
        "#statistics-prev-month"
      );

    const statisticsNextMonth =
      document.querySelector(
        "#statistics-next-month"
      );

    const statisticsCurrentMonth =
      document.querySelector(
        "#statistics-current-month"
      );

    const statisticsContent =
      document.querySelector(
        "#statistics-content"
      );

    const statisticsEmptyState =
      document.querySelector(
        "#statistics-empty-state"
      );

    const statisticsTotalCount =
      document.querySelector(
        "#statistics-total-count"
      );

    const statisticsCompletedCount =
      document.querySelector(
        "#statistics-completed-count"
      );

    const statisticsCompletionRate =
      document.querySelector(
        "#statistics-completion-rate"
      );

    const statisticsDailyAverage =
      document.querySelector(
        "#statistics-daily-average"
      );

    const statisticsProgressPercent =
      document.querySelector(
        "#statistics-progress-percent"
      );

    const statisticsProgressBar =
      document.querySelector(
        "#statistics-progress-bar"
      );

    const statisticsProgressCaption =
      document.querySelector(
        "#statistics-progress-caption"
      );

    const dailyActivityChart =
      document.querySelector(
        "#daily-activity-chart"
      );

    const categoryDonut =
      document.querySelector(
        "#category-donut"
      );

    const categoryDonutTotal =
      document.querySelector(
        "#category-donut-total"
      );

    const categoryLegend =
      document.querySelector(
        "#category-legend"
      );

    const categoryCompletionList =
      document.querySelector(
        "#category-completion-list"
      );

    const highPriorityPercent =
      document.querySelector(
        "#high-priority-percent"
      );

    const highPriorityCount =
      document.querySelector(
        "#high-priority-count"
      );

    const highPriorityBar =
      document.querySelector(
        "#high-priority-bar"
      );

    const busyDayDate =
      document.querySelector(
        "#busy-day-date"
      );

    const busyDayCount =
      document.querySelector(
        "#busy-day-count"
      );


    /* Settings */
    const clearTodosButton =
      document.querySelector(
        "#clear-todos-button"
      );


    /* ========================================
       03. State
    ======================================== */

    let todos =
      loadTodos();

    let editingTodoId =
      null;

    let currentStatusFilter =
      "all";

    let currentCategoryFilter =
      "all";

    let currentCalendarDate =
      new Date();

    let selectedDate =
      getLocalDateString();

    let statisticsDate =
      new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      );


    /* ========================================
       04. Utility
    ======================================== */

    function createTodoId() {

      if (
        window.crypto &&
        typeof
          window.crypto.randomUUID
          === "function"
      ) {

        return (
          window.crypto.randomUUID()
        );
      }


      return (
        "todo-" +
        Date.now() +
        "-" +
        Math.random()
          .toString(16)
          .slice(2)
      );
    }


    function getLocalDateString(
      date = new Date()
    ) {

      const year =
        date.getFullYear();


      const month =
        String(
          date.getMonth() + 1
        ).padStart(
          2,
          "0"
        );


      const day =
        String(
          date.getDate()
        ).padStart(
          2,
          "0"
        );


      return (
        year +
        "-" +
        month +
        "-" +
        day
      );
    }


    function getLocalTimeString(
      date = new Date()
    ) {

      const hour =
        String(
          date.getHours()
        ).padStart(
          2,
          "0"
        );


      const minute =
        String(
          date.getMinutes()
        ).padStart(
          2,
          "0"
        );


      return (
        hour +
        ":" +
        minute
      );
    }


    function escapeHTML(
      value
    ) {

      return String(value)
        .replaceAll(
          "&",
          "&amp;"
        )
        .replaceAll(
          "<",
          "&lt;"
        )
        .replaceAll(
          ">",
          "&gt;"
        )
        .replaceAll(
          '"',
          "&quot;"
        )
        .replaceAll(
          "'",
          "&#039;"
        );
    }


    function isValidTime(
      value
    ) {

      return (
        /^([01]\d|2[0-3]):[0-5]\d$/
          .test(value)
      );
    }


    function calculatePercent(
      completed,
      total
    ) {

      if (
        total === 0
      ) {

        return 0;
      }


      return (
        Math.round(
          completed /
          total *
          100
        )
      );
    }


    /* ========================================
       05. Category
    ======================================== */

    function getCategoryClass(
      category
    ) {

      const allowed = [
        "work",
        "study",
        "personal"
      ];


      return (
        allowed.includes(
          category
        )
          ?
          category
          :
          "personal"
      );
    }


    function getCategoryLabel(
      category
    ) {

      const labels = {
        work:
          "업무",

        study:
          "공부",

        personal:
          "개인"
      };


      return (
        labels[
          getCategoryClass(
            category
          )
        ]
      );
    }


    /* ========================================
       06. Priority
    ======================================== */

    function getPriorityClass(
      priority
    ) {

      if (
        priority === "normal"
      ) {

        return "medium";
      }


      const allowed = [
        "low",
        "medium",
        "high"
      ];


      return (
        allowed.includes(
          priority
        )
          ?
          priority
          :
          "medium"
      );
    }


    function getPriorityLabel(
      priority
    ) {

      const labels = {
        low:
          "낮음",

        medium:
          "보통",

        high:
          "높음"
      };


      return (
        labels[
          getPriorityClass(
            priority
          )
        ]
      );
    }


    function getPriorityWeight(
      priority
    ) {

      const weights = {
        low:
          1,

        medium:
          2,

        high:
          3
      };


      return (
        weights[
          getPriorityClass(
            priority
          )
        ]
      );
    }


    /* ========================================
       07. Migration
    ======================================== */

    function normalizeTodo(
      todo
    ) {

      const safeTodo =
        todo &&
        typeof todo === "object"
          ?
          todo
          :
          {};


      const dueDate =
        typeof safeTodo.dueDate === "string" &&
        /^\d{4}-\d{2}-\d{2}$/
          .test(
            safeTodo.dueDate
          )
          ?
          safeTodo.dueDate
          :
          getLocalDateString();


      const dueTime =
        typeof safeTodo.dueTime === "string" &&
        isValidTime(
          safeTodo.dueTime
        )
          ?
          safeTodo.dueTime
          :
          "00:00";


      return {

        id:
          safeTodo.id ||
          createTodoId(),

        title:
          typeof safeTodo.title === "string"
            ?
            safeTodo.title
            :
            "제목 없음",

        memo:
          typeof safeTodo.memo === "string"
            ?
            safeTodo.memo
            :
            "",

        category:
          getCategoryClass(
            safeTodo.category
          ),

        priority:
          getPriorityClass(
            safeTodo.priority
          ),

        dueDate:
          dueDate,

        dueTime:
          dueTime,

        completed:
          Boolean(
            safeTodo.completed
          ),

        createdAt:
          typeof safeTodo.createdAt === "string"
            ?
            safeTodo.createdAt
            :
            new Date()
              .toISOString(),

        completedAt:
          typeof safeTodo.completedAt === "string"
            ?
            safeTodo.completedAt
            :
            null
      };
    }


    /* ========================================
       08. Initial Data
    ======================================== */

    function createInitialTodos() {

      const today =
        getLocalDateString();


      return [

        {
          id:
            createTodoId(),

          title:
            "보고서 최종 수정",

          memo:
            "오탈자와 최종 수치를 다시 확인하기",

          category:
            "work",

          priority:
            "high",

          dueDate:
            today,

          dueTime:
            "14:30",

          completed:
            false,

          createdAt:
            new Date()
              .toISOString(),

          completedAt:
            null
        },


        {
          id:
            createTodoId(),

          title:
            "JavaScript 이벤트 위임 복습",

          memo:
            "Todo 이벤트 처리 구조 다시 정리",

          category:
            "study",

          priority:
            "high",

          dueDate:
            today,

          dueTime:
            "19:00",

          completed:
            false,

          createdAt:
            new Date()
              .toISOString(),

          completedAt:
            null
        },


        {
          id:
            createTodoId(),

          title:
            "이메일 확인 및 답장",

          memo:
            "회의 전에 주요 메일 먼저 처리",

          category:
            "work",

          priority:
            "medium",

          dueDate:
            today,

          dueTime:
            "13:00",

          completed:
            false,

          createdAt:
            new Date()
              .toISOString(),

          completedAt:
            null
        }

      ];
    }


    /* ========================================
       09. Storage
    ======================================== */

    function loadTodos() {

      try {

        const savedData =
          localStorage.getItem(
            STORAGE_KEY
          );


        if (
          savedData === null
        ) {

          const initial =
            createInitialTodos();


          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
              initial
            )
          );


          return initial;
        }


        const parsed =
          JSON.parse(
            savedData
          );


        if (
          !Array.isArray(
            parsed
          )
        ) {

          return [];
        }


        return (
          parsed.map(
            normalizeTodo
          )
        );

      } catch (error) {

        console.error(
          "Todo 데이터를 불러오지 못했습니다.",
          error
        );


        return [];
      }
    }


    function saveTodos() {

      try {

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            todos
          )
        );

      } catch (error) {

        console.error(
          "Todo 데이터를 저장하지 못했습니다.",
          error
        );
      }
    }


    /* ========================================
       10. Current Date
    ======================================== */

    function updateCurrentDate() {

      if (
        !currentDateElement
      ) {
        return;
      }


      currentDateElement.textContent =
        new Intl.DateTimeFormat(
          "ko-KR",
          {
            month:
              "long",

            day:
              "numeric",

            weekday:
              "long"
          }
        )
        .format(
          new Date()
        );
    }


    /* ========================================
       11. Navigation
    ======================================== */

    function changePage(
      targetPage
    ) {

      pageElements.forEach(
        function (page) {

          const active =
            page.dataset.page
            === targetPage;


          page.hidden =
            !active;


          page.classList.toggle(
            "is-active",
            active
          );
        }
      );


      navigationButtons.forEach(
        function (button) {

          button.classList.toggle(
            "is-active",
            button.dataset.targetPage
            === targetPage
          );
        }
      );


      if (
        targetPage === "calendar"
      ) {

        renderCalendar();

        renderSelectedDateTodos();
      }


      if (
        targetPage === "completed"
      ) {

        renderCompletedTodos();

        renderStatistics();
      }


      window.scrollTo({
        top:
          0,

        behavior:
          "smooth"
      });
    }


    navigationButtons.forEach(
      function (button) {

        button.addEventListener(
          "click",
          function () {

            changePage(
              button.dataset
                .targetPage
            );
          }
        );
      }
    );


    /* ========================================
       12. Record Tab
    ======================================== */

    function changeRecordTab(
      target
    ) {

      recordTabButtons.forEach(
        function (button) {

          const active =
            button.dataset.recordTab
            === target;


          button.classList.toggle(
            "is-active",
            active
          );


          button.setAttribute(
            "aria-selected",
            String(active)
          );
        }
      );


      recordPanels.forEach(
        function (panel) {

          const active =
            panel.dataset.recordPanel
            === target;


          panel.hidden =
            !active;


          panel.classList.toggle(
            "is-active",
            active
          );
        }
      );


      if (
        target === "statistics"
      ) {

        renderStatistics();
      }
    }


    recordTabButtons.forEach(
      function (button) {

        button.addEventListener(
          "click",
          function () {

            changeRecordTab(
              button.dataset.recordTab
            );
          }
        );
      }
    );


    /* ========================================
       13. Modal
    ======================================== */

    function resetTodoForm() {

      todoForm?.reset();


      const medium =
        document.querySelector(
          'input[name="priority"][value="medium"]'
        );


      if (
        medium
      ) {

        medium.checked =
          true;
      }


      if (
        todoCategoryInput
      ) {

        todoCategoryInput.value =
          "work";
      }


      if (
        todoDateInput
      ) {

        todoDateInput.value =
          getLocalDateString();
      }


      if (
        todoTimeInput
      ) {

        todoTimeInput.value =
          getLocalTimeString();
      }
    }


    function openTodoModal(
      todoId = null
    ) {

      if (
        !todoModal
      ) {
        return;
      }


      editingTodoId =
        todoId;


      if (
        todoId
      ) {

        const todo =
          todos.find(
            function (item) {

              return (
                item.id
                === todoId
              );
            }
          );


        if (
          !todo
        ) {
          return;
        }


        todoModalTitle.textContent =
          "할 일 수정";


        todoSubmitButton.textContent =
          "수정하기";


        todoTitleInput.value =
          todo.title;


        todoMemoInput.value =
          todo.memo;


        todoDateInput.value =
          todo.dueDate;


        todoTimeInput.value =
          todo.dueTime;


        todoCategoryInput.value =
          todo.category;


        const priorityInput =
          document.querySelector(
            'input[name="priority"][value="' +
            todo.priority +
            '"]'
          );


        if (
          priorityInput
        ) {

          priorityInput.checked =
            true;
        }

      } else {

        resetTodoForm();


        todoModalTitle.textContent =
          "할 일 추가";


        todoSubmitButton.textContent =
          "저장하기";
      }


      todoModal.classList.add(
        "is-open"
      );


      todoModal.setAttribute(
        "aria-hidden",
        "false"
      );


      document.body.classList.add(
        "is-modal-open"
      );


      window.setTimeout(
        function () {

          todoTitleInput
            ?.focus();

        },
        50
      );
    }


    function closeTodoModal() {

      todoModal?.classList.remove(
        "is-open"
      );


      todoModal?.setAttribute(
        "aria-hidden",
        "true"
      );


      document.body.classList.remove(
        "is-modal-open"
      );


      editingTodoId =
        null;


      resetTodoForm();
    }


    openModalButtons.forEach(
      function (button) {

        button.addEventListener(
          "click",
          function () {

            openTodoModal();
          }
        );
      }
    );


    closeModalButtons.forEach(
      function (button) {

        button.addEventListener(
          "click",
          closeTodoModal
        );
      }
    );


    /* ========================================
       14. CRUD
    ======================================== */

    function addTodo(
      title,
      memo,
      category,
      priority,
      dueDate,
      dueTime
    ) {

      todos = [
        ...todos,
        {
          id:
            createTodoId(),

          title,

          memo,

          category,

          priority,

          dueDate,

          dueTime,

          completed:
            false,

          createdAt:
            new Date()
              .toISOString(),

          completedAt:
            null
        }
      ];


      saveTodos();

      renderAll();
    }


    function updateTodo(
      todoId,
      title,
      memo,
      category,
      priority,
      dueDate,
      dueTime
    ) {

      todos =
        todos.map(
          function (todo) {

            if (
              todo.id
              !== todoId
            ) {

              return todo;
            }


            return {
              ...todo,

              title,

              memo,

              category,

              priority,

              dueDate,

              dueTime
            };
          }
        );


      saveTodos();

      renderAll();
    }


    function deleteTodo(
      todoId
    ) {

      const todo =
        todos.find(
          function (item) {

            return (
              item.id
              === todoId
            );
          }
        );


      if (
        !todo
      ) {
        return;
      }


      const confirmed =
        window.confirm(
          '"' +
          todo.title +
          '" 할 일을 삭제하시겠습니까?'
        );


      if (
        !confirmed
      ) {
        return;
      }


      todos =
        todos.filter(
          function (item) {

            return (
              item.id
              !== todoId
            );
          }
        );


      saveTodos();

      renderAll();
    }


    function toggleTodo(
      todoId
    ) {

      todos =
        todos.map(
          function (todo) {

            if (
              todo.id
              !== todoId
            ) {

              return todo;
            }


            const completed =
              !todo.completed;


            return {
              ...todo,

              completed,

              completedAt:
                completed
                  ?
                  new Date()
                    .toISOString()
                  :
                  null
            };
          }
        );


      saveTodos();

      renderAll();
    }


    function restoreTodo(
      todoId
    ) {

      todos =
        todos.map(
          function (todo) {

            if (
              todo.id
              !== todoId
            ) {

              return todo;
            }


            return {
              ...todo,

              completed:
                false,

              completedAt:
                null
            };
          }
        );


      saveTodos();

      renderAll();
    }


    /* ========================================
       15. Form Submit
    ======================================== */

    todoForm?.addEventListener(
      "submit",
      function (event) {

        event.preventDefault();


        const title =
          todoTitleInput.value
            .trim();


        const memo =
          todoMemoInput.value
            .trim();


        const dueDate =
          todoDateInput.value;


        const dueTime =
          todoTimeInput.value;


        const category =
          getCategoryClass(
            todoCategoryInput.value
          );


        const priority =
          getPriorityClass(
            document.querySelector(
              'input[name="priority"]:checked'
            )
            ?.value
          );


        if (
          !title
        ) {

          window.alert(
            "할 일을 입력해주세요."
          );

          todoTitleInput.focus();

          return;
        }


        if (
          !dueDate
        ) {

          window.alert(
            "날짜를 선택해주세요."
          );

          todoDateInput.focus();

          return;
        }


        if (
          !isValidTime(
            dueTime
          )
        ) {

          window.alert(
            "올바른 시간을 선택해주세요."
          );

          todoTimeInput.focus();

          return;
        }


        if (
          editingTodoId
        ) {

          updateTodo(
            editingTodoId,
            title,
            memo,
            category,
            priority,
            dueDate,
            dueTime
          );

        } else {

          addTodo(
            title,
            memo,
            category,
            priority,
            dueDate,
            dueTime
          );
        }


        closeTodoModal();
      }
    );


    /* ========================================
       16. Today
    ======================================== */

    function getTodayTodos() {

      const today =
        getLocalDateString();


      return (
        todos.filter(
          function (todo) {

            return (
              todo.dueDate
              === today
            );
          }
        )
      );
    }


    function getFilteredTodayTodos() {

      let result =
        getTodayTodos();


      if (
        currentStatusFilter
        === "active"
      ) {

        result =
          result.filter(
            function (todo) {

              return (
                !todo.completed
              );
            }
          );
      }


      if (
        currentCategoryFilter
        !== "all"
      ) {

        result =
          result.filter(
            function (todo) {

              return (
                todo.category
                === currentCategoryFilter
              );
            }
          );
      }


      return result;
    }


    function renderTodayTodos() {

      const visibleTodos =
        [...getFilteredTodayTodos()]
          .sort(
            function (
              a,
              b
            ) {

              const priorityDiff =
                getPriorityWeight(
                  b.priority
                )
                -
                getPriorityWeight(
                  a.priority
                );


              if (
                priorityDiff !== 0
              ) {

                return priorityDiff;
              }


              return (
                a.dueTime
                  .localeCompare(
                    b.dueTime
                  )
              );
            }
          );


      if (
        visibleTodos.length
        === 0
      ) {

        todayTodoList.innerHTML =
          "";


        todayEmptyState.hidden =
          false;


        return;
      }


      todayEmptyState.hidden =
        true;


      todayTodoList.innerHTML =
        visibleTodos
          .map(
            function (todo) {

              const category =
                getCategoryClass(
                  todo.category
                );


              const priority =
                getPriorityClass(
                  todo.priority
                );


              return `
                <li
                  class="todo-item${todo.completed ? " is-completed" : ""}"
                  data-todo-id="${todo.id}"
                >

                  <label class="todo-check">

                    <input
                      type="checkbox"
                      data-action="toggle"
                      ${todo.completed ? "checked" : ""}
                      aria-label="${escapeHTML(todo.title)} 완료 상태 변경"
                    >

                    <span
                      class="todo-checkmark"
                    ></span>

                  </label>


                  <div class="todo-info">

                    <strong class="todo-title">
                      ${escapeHTML(todo.title)}
                    </strong>


                    ${
                      todo.memo
                        ?
                        `
                        <p class="todo-memo">
                          ${escapeHTML(todo.memo)}
                        </p>
                        `
                        :
                        ""
                    }


                    <div class="todo-info-bottom">

                      <div class="todo-meta">

                        <span>
                          ${todo.completed ? "완료" : "오늘"}
                        </span>

                        <span class="todo-meta-separator">
                          ·
                        </span>

                        <span>
                          ${escapeHTML(todo.dueTime)}
                        </span>

                      </div>


                      <span
                        class="category-badge category-badge--${category}"
                      >
                        ${getCategoryLabel(category)}
                      </span>


                      <span
                        class="priority-badge priority-badge--${priority}"
                      >
                        ${getPriorityLabel(priority)}
                      </span>

                    </div>

                  </div>


                  <div class="todo-actions">

                    <button
                      type="button"
                      class="todo-action-button"
                      data-action="edit"
                    >
                      수정
                    </button>

                    <button
                      type="button"
                      class="todo-action-button todo-delete-button"
                      data-action="delete"
                    >
                      삭제
                    </button>

                  </div>

                </li>
              `;
            }
          )
          .join("");
    }


    /* ========================================
       Today Events
    ======================================== */

    todayTodoList?.addEventListener(
      "click",
      function (event) {

        const item =
          event.target.closest(
            "[data-todo-id]"
          );


        const action =
          event.target.closest(
            "[data-action]"
          );


        if (
          !item ||
          !action
        ) {
          return;
        }


        if (
          action.dataset.action
          === "edit"
        ) {

          openTodoModal(
            item.dataset.todoId
          );

        } else if (
          action.dataset.action
          === "delete"
        ) {

          deleteTodo(
            item.dataset.todoId
          );
        }
      }
    );


    todayTodoList?.addEventListener(
      "change",
      function (event) {

        const checkbox =
          event.target.closest(
            '[data-action="toggle"]'
          );


        if (
          !checkbox
        ) {
          return;
        }


        const item =
          checkbox.closest(
            "[data-todo-id]"
          );


        if (
          item
        ) {

          toggleTodo(
            item.dataset.todoId
          );
        }
      }
    );


    /* ========================================
       17. Focus
    ======================================== */

    function renderFocusTodos() {

      const today =
        getLocalDateString();


      const focusTodos =
        todos
          .filter(
            function (todo) {

              return (
                todo.dueDate
                  === today
                &&
                todo.priority
                  === "high"
                &&
                !todo.completed
              );
            }
          )
          .sort(
            function (
              a,
              b
            ) {

              return (
                a.dueTime
                  .localeCompare(
                    b.dueTime
                  )
              );
            }
          )
          .slice(
            0,
            3
          );


      focusCount.textContent =
        focusTodos.length
        +
        "개";


      if (
        focusTodos.length
        === 0
      ) {

        focusList.innerHTML =
          "";


        focusEmptyState.hidden =
          false;


        return;
      }


      focusEmptyState.hidden =
        true;


      focusList.innerHTML =
        focusTodos
          .map(
            function (
              todo,
              index
            ) {

              return `
                <li
                  class="focus-item"
                  data-focus-id="${todo.id}"
                >

                  <span class="focus-number">
                    ${String(index + 1).padStart(2, "0")}
                  </span>


                  <button
                    type="button"
                    class="focus-content"
                    data-focus-action="edit"
                  >

                    <strong class="focus-title">
                      ${escapeHTML(todo.title)}
                    </strong>

                    <span class="focus-meta">
                      ${getCategoryLabel(todo.category)}
                      ·
                      ${escapeHTML(todo.dueTime)}
                      ·
                      높음
                    </span>

                  </button>


                  <button
                    type="button"
                    class="focus-check-button"
                    data-focus-action="toggle"
                    aria-label="완료 처리"
                  >
                    <span></span>
                  </button>

                </li>
              `;
            }
          )
          .join("");
    }


    focusList?.addEventListener(
      "click",
      function (event) {

        const item =
          event.target.closest(
            "[data-focus-id]"
          );


        const action =
          event.target.closest(
            "[data-focus-action]"
          );


        if (
          !item ||
          !action
        ) {
          return;
        }


        if (
          action.dataset.focusAction
          === "edit"
        ) {

          openTodoModal(
            item.dataset.focusId
          );

        } else {

          toggleTodo(
            item.dataset.focusId
          );
        }
      }
    );


    /* ========================================
       18. Progress
    ======================================== */

    function updateProgress() {

      const todayTodos =
        getTodayTodos();


      const total =
        todayTodos.length;


      const completed =
        todayTodos.filter(
          function (todo) {

            return (
              todo.completed
            );
          }
        ).length;


      const remaining =
        total -
        completed;


      const percent =
        calculatePercent(
          completed,
          total
        );


      progressPercent.textContent =
        percent;


      progressCount.textContent =
        completed
        +
        " / "
        +
        total
        +
        " 완료";


      progressRemaining.textContent =
        total === 0
          ?
          "등록된 할 일이 없습니다."
          :
          remaining === 0
            ?
            "오늘 할 일을 모두 완료했습니다."
            :
            remaining +
            "개의 할 일이 남았습니다.";


      progressBar.style.width =
        percent
        +
        "%";


      progressTrack.setAttribute(
        "aria-valuenow",
        String(percent)
      );


      progressBottomPercent.textContent =
        percent
        +
        "%";
    }


    /* ========================================
       19. Filter
    ======================================== */

    statusFilterButtons.forEach(
      function (button) {

        button.addEventListener(
          "click",
          function () {

            currentStatusFilter =
              button.dataset
                .statusFilter;


            statusFilterButtons.forEach(
              function (item) {

                item.classList.toggle(
                  "is-active",
                  item === button
                );
              }
            );


            renderTodayTodos();
          }
        );
      }
    );


    categoryFilterButtons.forEach(
      function (button) {

        button.addEventListener(
          "click",
          function () {

            currentCategoryFilter =
              button.dataset
                .categoryFilter;


            categoryFilterButtons.forEach(
              function (item) {

                item.classList.toggle(
                  "is-active",
                  item === button
                );
              }
            );


            renderTodayTodos();
          }
        );
      }
    );


    /* ========================================
       20. Calendar
    ======================================== */

    function formatCalendarTitle(
      date
    ) {

      return (
        date.getFullYear()
        +
        "년 "
        +
        (
          date.getMonth()
          +
          1
        )
        +
        "월"
      );
    }


    function formatSelectedDateTitle(
      value
    ) {

      const [
        year,
        month,
        day
      ] =
        value
          .split("-")
          .map(Number);


      const date =
        new Date(
          year,
          month - 1,
          day
        );


      return (
        new Intl.DateTimeFormat(
          "ko-KR",
          {
            month:
              "long",

            day:
              "numeric",

            weekday:
              "long"
          }
        )
        .format(
          date
        )
      );
    }


    function hasTodoOnDate(
      dateString
    ) {

      return (
        todos.some(
          function (todo) {

            return (
              todo.dueDate
              === dateString
            );
          }
        )
      );
    }


    function renderCalendar() {

      const year =
        currentCalendarDate
          .getFullYear();


      const month =
        currentCalendarDate
          .getMonth();


      calendarCurrentMonth.textContent =
        formatCalendarTitle(
          currentCalendarDate
        );


      const firstWeekday =
        new Date(
          year,
          month,
          1
        )
        .getDay();


      const gridStart =
        new Date(
          year,
          month,
          1 - firstWeekday
        );


      const today =
        getLocalDateString();


      let html =
        "";


      for (
        let i = 0;
        i < 42;
        i += 1
      ) {

        const date =
          new Date(
            gridStart.getFullYear(),
            gridStart.getMonth(),
            gridStart.getDate()
            + i
          );


        const dateString =
          getLocalDateString(
            date
          );


        const classes = [
          "calendar-day"
        ];


        if (
          date.getMonth()
          !== month
        ) {

          classes.push(
            "is-muted"
          );
        }


        if (
          dateString
          === today
        ) {

          classes.push(
            "is-today"
          );
        }


        if (
          dateString
          === selectedDate
        ) {

          classes.push(
            "is-selected"
          );
        }


        html += `
          <button
            type="button"
            class="${classes.join(" ")}"
            data-calendar-date="${dateString}"
          >

            <span>
              ${date.getDate()}
            </span>

            ${
              hasTodoOnDate(
                dateString
              )
                ?
                '<span class="calendar-dot"></span>'
                :
                ""
            }

          </button>
        `;
      }


      calendarGrid.innerHTML =
        html;
    }


    function changeCalendarMonth(
      amount
    ) {

      currentCalendarDate =
        new Date(
          currentCalendarDate
            .getFullYear(),

          currentCalendarDate
            .getMonth()
            + amount,

          1
        );


      renderCalendar();
    }


    calendarPrevButton
      ?.addEventListener(
        "click",
        function () {

          changeCalendarMonth(
            -1
          );
        }
      );


    calendarNextButton
      ?.addEventListener(
        "click",
        function () {

          changeCalendarMonth(
            1
          );
        }
      );


    calendarGrid
      ?.addEventListener(
        "click",
        function (event) {

          const button =
            event.target.closest(
              "[data-calendar-date]"
            );


          if (
            !button
          ) {
            return;
          }


          selectedDate =
            button.dataset
              .calendarDate;


          const [
            year,
            month
          ] =
            selectedDate
              .split("-")
              .map(Number);


          currentCalendarDate =
            new Date(
              year,
              month - 1,
              1
            );


          renderCalendar();

          renderSelectedDateTodos();
        }
      );


    /* ========================================
       21. Selected Date Todos

       이번 수정 핵심:
       기존 원형 status-dot 제거
       → 오늘 할 일과 동일한 사각형 Checkbox
    ======================================== */

    function renderSelectedDateTodos() {

      selectedDateTitle.textContent =
        formatSelectedDateTitle(
          selectedDate
        );


      const dateTodos =
        todos
          .filter(
            function (todo) {

              return (
                todo.dueDate
                === selectedDate
              );
            }
          )
          .sort(
            function (
              a,
              b
            ) {

              return (
                a.dueTime
                  .localeCompare(
                    b.dueTime
                  )
              );
            }
          );


      if (
        dateTodos.length
        === 0
      ) {

        selectedDateTodoList.innerHTML =
          "";


        selectedDateEmptyState.hidden =
          false;


        return;
      }


      selectedDateEmptyState.hidden =
        true;


      selectedDateTodoList.innerHTML =
        dateTodos
          .map(
            function (todo) {

              const category =
                getCategoryClass(
                  todo.category
                );


              const priority =
                getPriorityClass(
                  todo.priority
                );


              return `
                <li
                  class="schedule-todo-item${todo.completed ? " is-completed" : ""}"
                  data-schedule-id="${todo.id}"
                >

                  <!-- 시간 -->
                  <div class="schedule-time">
                    ${escapeHTML(todo.dueTime)}
                  </div>


                  <div class="schedule-main">

                    <!-- 제목 + 수정/삭제 -->
                    <div class="schedule-heading-row">

                      <strong class="schedule-title">
                        ${escapeHTML(todo.title)}
                      </strong>


                      <div class="schedule-manage-actions">

                        <button
                          type="button"
                          class="schedule-manage-button"
                          data-schedule-action="edit"
                        >
                          수정
                        </button>

                        <button
                          type="button"
                          class="schedule-manage-button schedule-delete-button"
                          data-schedule-action="delete"
                        >
                          삭제
                        </button>

                      </div>

                    </div>


                    ${
                      todo.memo
                        ?
                        `
                        <p class="schedule-memo">
                          ${escapeHTML(todo.memo)}
                        </p>
                        `
                        :
                        ""
                    }


                    <!-- Category / Priority -->
                    <div class="schedule-badges">

                      <span
                        class="category-badge category-badge--${category}"
                      >
                        ${getCategoryLabel(category)}
                      </span>


                      <span
                        class="priority-badge priority-badge--${priority}"
                      >
                        ${getPriorityLabel(priority)}
                      </span>

                    </div>


                    <!-- ========================================
                         완료 상태

                         오늘 Todo Checkbox와 동일한
                         사각형 체크 형태
                    ======================================== -->
                    <div class="schedule-status-row">

                      <button
                        type="button"
                        class="schedule-status-button${todo.completed ? " is-completed" : ""}"
                        data-schedule-action="toggle"
                        aria-label="${escapeHTML(todo.title)} 완료 상태 변경"
                      >

                        <span
                          class="schedule-status-check"
                          aria-hidden="true"
                        ></span>

                        <span>
                          ${todo.completed ? "완료됨" : "미완료"}
                        </span>

                      </button>

                    </div>

                  </div>

                </li>
              `;
            }
          )
          .join("");
    }


    /* ========================================
       Schedule Events
    ======================================== */

    selectedDateTodoList
      ?.addEventListener(
        "click",
        function (event) {

          const item =
            event.target.closest(
              "[data-schedule-id]"
            );


          const action =
            event.target.closest(
              "[data-schedule-action]"
            );


          if (
            !item ||
            !action
          ) {
            return;
          }


          const todoId =
            item.dataset
              .scheduleId;


          if (
            action.dataset
              .scheduleAction
            === "toggle"
          ) {

            toggleTodo(
              todoId
            );

          } else if (
            action.dataset
              .scheduleAction
            === "edit"
          ) {

            openTodoModal(
              todoId
            );

          } else if (
            action.dataset
              .scheduleAction
            === "delete"
          ) {

            deleteTodo(
              todoId
            );
          }
        }
      );


    /* ========================================
       22. Completed
    ======================================== */

    function formatCompletedDateTime(
      value
    ) {

      if (
        !value
      ) {

        return "완료 시간 없음";
      }


      const date =
        new Date(
          value
        );


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {

        return "완료 시간 없음";
      }


      return (
        new Intl.DateTimeFormat(
          "ko-KR",
          {
            month:
              "long",

            day:
              "numeric",

            hour:
              "numeric",

            minute:
              "2-digit"
          }
        )
        .format(
          date
        )
      );
    }


    function renderCompletedTodos() {

      const completedTodos =
        todos
          .filter(
            function (todo) {

              return (
                todo.completed
              );
            }
          )
          .sort(
            function (
              a,
              b
            ) {

              const aTime =
                new Date(
                  a.completedAt
                  ||
                  0
                )
                .getTime();


              const bTime =
                new Date(
                  b.completedAt
                  ||
                  0
                )
                .getTime();


              return (
                bTime -
                aTime
              );
            }
          );


      completedCount.textContent =
        completedTodos.length
        +
        "개";


      if (
        completedTodos.length
        === 0
      ) {

        completedList.innerHTML =
          "";


        completedEmptyState.hidden =
          false;


        return;
      }


      completedEmptyState.hidden =
        true;


      completedList.innerHTML =
        completedTodos
          .map(
            function (todo) {

              const category =
                getCategoryClass(
                  todo.category
                );


              const priority =
                getPriorityClass(
                  todo.priority
                );


              return `
                <li
                  class="completed-item"
                  data-completed-id="${todo.id}"
                >

                  <span class="completed-check">
                    ✓
                  </span>


                  <div class="completed-content">

                    <strong class="completed-title">
                      ${escapeHTML(todo.title)}
                    </strong>


                    ${
                      todo.memo
                        ?
                        `
                        <p class="completed-memo">
                          ${escapeHTML(todo.memo)}
                        </p>
                        `
                        :
                        ""
                    }


                    <div class="completed-meta">

                      <span>
                        예정 ${escapeHTML(todo.dueDate)}
                      </span>

                      <span>
                        ·
                      </span>

                      <span>
                        ${escapeHTML(todo.dueTime)}
                      </span>

                      <span>
                        ·
                      </span>

                      <span>
                        완료
                        ${escapeHTML(
                          formatCompletedDateTime(
                            todo.completedAt
                          )
                        )}
                      </span>

                    </div>


                    <div class="completed-badges">

                      <span
                        class="category-badge category-badge--${category}"
                      >
                        ${getCategoryLabel(category)}
                      </span>


                      <span
                        class="priority-badge priority-badge--${priority}"
                      >
                        ${getPriorityLabel(priority)}
                      </span>

                    </div>

                  </div>


                  <button
                    type="button"
                    class="restore-button"
                    data-completed-action="restore"
                  >
                    복원
                  </button>

                </li>
              `;
            }
          )
          .join("");
    }


    completedList
      ?.addEventListener(
        "click",
        function (event) {

          const item =
            event.target.closest(
              "[data-completed-id]"
            );


          const action =
            event.target.closest(
              "[data-completed-action]"
            );


          if (
            item &&
            action
          ) {

            restoreTodo(
              item.dataset
                .completedId
            );
          }
        }
      );


    /* ========================================
       23. Statistics Helpers
    ======================================== */

    function getStatisticsMonthKey() {

      const year =
        statisticsDate
          .getFullYear();


      const month =
        String(
          statisticsDate
            .getMonth()
            + 1
        )
        .padStart(
          2,
          "0"
        );


      return (
        year +
        "-" +
        month
      );
    }


    function getStatisticsMonthTodos() {

      const monthKey =
        getStatisticsMonthKey();


      return (
        todos.filter(
          function (todo) {

            return (
              todo.dueDate
                .startsWith(
                  monthKey
                )
            );
          }
        )
      );
    }


    function getDaysInStatisticsMonth() {

      return (
        new Date(
          statisticsDate
            .getFullYear(),

          statisticsDate
            .getMonth()
            + 1,

          0
        )
        .getDate()
      );
    }


    /* ========================================
       24. Daily Statistics
    ======================================== */

    function createDailyStatistics(
      monthTodos
    ) {

      const days =
        getDaysInStatisticsMonth();


      const result =
        [];


      for (
        let day = 1;
        day <= days;
        day += 1
      ) {

        const dayText =
          String(
            day
          )
          .padStart(
            2,
            "0"
          );


        const dateString =
          getStatisticsMonthKey()
          +
          "-"
          +
          dayText;


        const dayTodos =
          monthTodos.filter(
            function (todo) {

              return (
                todo.dueDate
                === dateString
              );
            }
          );


        const completed =
          dayTodos.filter(
            function (todo) {

              return (
                todo.completed
              );
            }
          ).length;


        result.push({
          day:
            day,

          date:
            dateString,

          total:
            dayTodos.length,

          completed:
            completed
        });
      }


      return result;
    }


    /* ========================================
       25. Daily Chart
    ======================================== */

    function renderDailyActivityChart(
      dailyData
    ) {

      const maxValue =
        Math.max(
          1,
          ...dailyData.map(
            function (item) {

              return (
                item.total
              );
            }
          )
        );


      dailyActivityChart.innerHTML =
        dailyData
          .map(
            function (item) {

              const height =
                item.total === 0
                  ?
                  2
                  :
                  Math.max(
                    10,
                    Math.round(
                      item.total /
                      maxValue *
                      100
                    )
                  );


              return `
                <div
                  class="daily-chart-column"
                  title="${item.date} · 등록 ${item.total}개 · 완료 ${item.completed}개"
                >

                  <span class="daily-chart-value">
                    ${item.total > 0 ? item.total : ""}
                  </span>


                  <div class="daily-chart-bar-area">

                    <span
                      class="daily-chart-bar${item.total === 0 ? " is-empty" : ""}"
                      style="height: ${height}%;"
                    ></span>

                  </div>


                  <span class="daily-chart-label">
                    ${item.day}
                  </span>

                </div>
              `;
            }
          )
          .join("");
    }


    /* ========================================
       26. Category Statistics
    ======================================== */

    function renderCategoryStatistics(
      monthTodos
    ) {

      const categories = [

        {
          key:
            "work",

          label:
            "업무",

          cssColor:
            "var(--work-color)"
        },

        {
          key:
            "study",

          label:
            "공부",

          cssColor:
            "var(--study-color)"
        },

        {
          key:
            "personal",

          label:
            "개인",

          cssColor:
            "var(--personal-color)"
        }

      ];


      const total =
        monthTodos.length;


      let start =
        0;


      const gradients =
        [];


      const legendHTML =
        [];


      categories.forEach(
        function (category) {

          const categoryTodos =
            monthTodos.filter(
              function (todo) {

                return (
                  todo.category
                  === category.key
                );
              }
            );


          const count =
            categoryTodos.length;


          const percent =
            total === 0
              ?
              0
              :
              Math.round(
                count /
                total *
                100
              );


          const end =
            start +
            percent;


          if (
            percent > 0
          ) {

            gradients.push(
              category.cssColor
              +
              " "
              +
              start
              +
              "% "
              +
              end
              +
              "%"
            );
          }


          start =
            end;


          legendHTML.push(`
            <div class="category-legend-item">

              <span
                class="category-legend-dot category-legend-dot--${category.key}"
              ></span>

              <span>
                ${category.label}
              </span>

              <span class="category-legend-value">
                ${count}개 · ${percent}%
              </span>

            </div>
          `);
        }
      );


      if (
        gradients.length === 0
      ) {

        categoryDonut.style.background =
          "#e6eaec";

      } else {

        if (
          start < 100
        ) {

          gradients.push(
            "#e6eaec "
            +
            start
            +
            "% 100%"
          );
        }


        categoryDonut.style.background =
          "conic-gradient("
          +
          gradients.join(",")
          +
          ")";
      }


      categoryDonutTotal.textContent =
        total;


      categoryLegend.innerHTML =
        legendHTML.join("");
    }


    /* ========================================
       27. Category Completion
    ======================================== */

    function renderCategoryCompletion(
      monthTodos
    ) {

      const categories = [

        {
          key:
            "work",

          label:
            "업무"
        },

        {
          key:
            "study",

          label:
            "공부"
        },

        {
          key:
            "personal",

          label:
            "개인"
        }

      ];


      categoryCompletionList.innerHTML =
        categories
          .map(
            function (category) {

              const categoryTodos =
                monthTodos.filter(
                  function (todo) {

                    return (
                      todo.category
                      === category.key
                    );
                  }
                );


              const completed =
                categoryTodos.filter(
                  function (todo) {

                    return (
                      todo.completed
                    );
                  }
                ).length;


              const percent =
                calculatePercent(
                  completed,
                  categoryTodos.length
                );


              return `
                <div class="category-completion-item">

                  <div class="category-completion-head">

                    <strong>
                      ${category.label}
                    </strong>

                    <span>
                      ${completed} / ${categoryTodos.length}
                      ·
                      ${percent}%
                    </span>

                  </div>


                  <div class="category-completion-track">

                    <div
                      class="category-completion-bar category-completion-bar--${category.key}"
                      style="width: ${percent}%;"
                    ></div>

                  </div>

                </div>
              `;
            }
          )
          .join("");
    }


    /* ========================================
       28. High Priority Statistics
    ======================================== */

    function renderHighPriorityStatistics(
      monthTodos
    ) {

      const highTodos =
        monthTodos.filter(
          function (todo) {

            return (
              todo.priority
              === "high"
            );
          }
        );


      const completed =
        highTodos.filter(
          function (todo) {

            return (
              todo.completed
            );
          }
        ).length;


      const percent =
        calculatePercent(
          completed,
          highTodos.length
        );


      highPriorityPercent.textContent =
        percent
        +
        "%";


      highPriorityCount.textContent =
        completed
        +
        " / "
        +
        highTodos.length
        +
        " 완료";


      highPriorityBar.style.width =
        percent
        +
        "%";
    }


    /* ========================================
       29. Busy Day
    ======================================== */

    function renderBusyDay(
      dailyData
    ) {

      const busyDay =
        dailyData.reduce(
          function (
            best,
            current
          ) {

            if (
              current.total
              >
              best.total
            ) {

              return current;
            }


            return best;
          },
          {
            day:
              null,

            total:
              0
          }
        );


      if (
        busyDay.total === 0
      ) {

        busyDayDate.textContent =
          "-";


        busyDayCount.textContent =
          "등록된 Todo가 없습니다.";


        return;
      }


      busyDayDate.textContent =
        (
          statisticsDate
            .getMonth()
          +
          1
        )
        +
        "월 "
        +
        busyDay.day
        +
        "일";


      busyDayCount.textContent =
        busyDay.total
        +
        "개의 Todo가 있었습니다.";
    }


    /* ========================================
       30. Statistics Main
    ======================================== */

    function renderStatistics() {

      const monthTodos =
        getStatisticsMonthTodos();


      statisticsCurrentMonth.textContent =
        formatCalendarTitle(
          statisticsDate
        );


      if (
        monthTodos.length === 0
      ) {

        statisticsContent.hidden =
          true;


        statisticsEmptyState.hidden =
          false;


        return;
      }


      statisticsContent.hidden =
        false;


      statisticsEmptyState.hidden =
        true;


      const completed =
        monthTodos.filter(
          function (todo) {

            return (
              todo.completed
            );
          }
        ).length;


      const total =
        monthTodos.length;


      const completionRate =
        calculatePercent(
          completed,
          total
        );


      const dailyData =
        createDailyStatistics(
          monthTodos
        );


      const activeDays =
        dailyData.filter(
          function (item) {

            return (
              item.total > 0
            );
          }
        ).length;


      const dailyAverage =
        activeDays === 0
          ?
          0
          :
          (
            total /
            activeDays
          )
          .toFixed(1);


      statisticsTotalCount.textContent =
        total;


      statisticsCompletedCount.textContent =
        completed;


      statisticsCompletionRate.textContent =
        completionRate;


      statisticsDailyAverage.textContent =
        dailyAverage;


      statisticsProgressPercent.textContent =
        completionRate
        +
        "%";


      statisticsProgressBar.style.width =
        completionRate
        +
        "%";


      statisticsProgressCaption.textContent =
        completed
        +
        " / "
        +
        total
        +
        "개의 Todo를 완료했습니다.";


      renderDailyActivityChart(
        dailyData
      );


      renderCategoryStatistics(
        monthTodos
      );


      renderCategoryCompletion(
        monthTodos
      );


      renderHighPriorityStatistics(
        monthTodos
      );


      renderBusyDay(
        dailyData
      );
    }


    /* ========================================
       31. Statistics Month Navigation
    ======================================== */

    function changeStatisticsMonth(
      amount
    ) {

      statisticsDate =
        new Date(
          statisticsDate
            .getFullYear(),

          statisticsDate
            .getMonth()
            +
            amount,

          1
        );


      renderStatistics();
    }


    statisticsPrevMonth
      ?.addEventListener(
        "click",
        function () {

          changeStatisticsMonth(
            -1
          );
        }
      );


    statisticsNextMonth
      ?.addEventListener(
        "click",
        function () {

          changeStatisticsMonth(
            1
          );
        }
      );


    /* ========================================
       32. Clear All
    ======================================== */

    function clearAllTodos() {

      const confirmed =
        window.confirm(
          "모든 할 일 데이터를 삭제하시겠습니까?\n\n삭제한 데이터는 복구할 수 없습니다."
        );


      if (
        !confirmed
      ) {
        return;
      }


      todos =
        [];


      saveTodos();


      selectedDate =
        getLocalDateString();


      currentCalendarDate =
        new Date();


      statisticsDate =
        new Date(
          new Date()
            .getFullYear(),

          new Date()
            .getMonth(),

          1
        );


      renderAll();


      window.alert(
        "모든 할 일 데이터가 초기화되었습니다."
      );
    }


    clearTodosButton
      ?.addEventListener(
        "click",
        clearAllTodos
      );


    /* ========================================
       33. Escape
    ======================================== */

    document.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key === "Escape"
          &&
          todoModal
            ?.classList
            .contains(
              "is-open"
            )
        ) {

          closeTodoModal();
        }
      }
    );


    /* ========================================
       34. Render All
    ======================================== */

    function renderAll() {

      renderTodayTodos();

      renderFocusTodos();

      updateProgress();

      renderCalendar();

      renderSelectedDateTodos();

      renderCompletedTodos();

      renderStatistics();
    }


    /* ========================================
       35. Initial Run
    ======================================== */

    updateCurrentDate();


    /*
      이전 버전 LocalStorage Data를
      현재 구조로 보정 후 다시 저장합니다.
    */
    saveTodos();


    renderAll();

  }
);