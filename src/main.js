import './assets/main2.css'
import 'primeicons/primeicons.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import App from './App.vue'
import router from './router'
import { createI18n } from 'vue-i18n';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faBell, faBellSlash } from '@fortawesome/free-solid-svg-icons'

library.add(faBell, faBellSlash)

const i18n = createI18n({
  legacy: false, // QUAN TRỌNG: Sử dụng Composition API mode
  globalInjection: true, // Cho phép sử dụng $t, $tc, v.v. trong template
  locale: localStorage.getItem('language') || 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      FAISmart_Security: "Smart Security",
      Status: "Status",
      Visitors: "Visitors",
      Alarms: "Alarms",
      Violations: "Violations",
      Resources: "Resources",
      LIVE_View: "LIVE View",
      Virtual_Tour: "Virtual Tour",
      Notifications: "Notifications",
      Settings: "Settings",
      Logout: "Logout",
      Event_Logs: "Event Logs",
      Filter_by_camera:"Filter by camera",
      Filter_by_ID:"Filter by ID",
      Filter_by_error_code:"Filter by error code",
      Filter_by_location:"Filter by location",
      Cameras: "Cameras",
      Tags: "Tags",
      Users: "Users",
      Add_New_Camera:"Add New Camera",
      Edit:"Edit",
      delete:"Delete",
      View_Details:"View Details",
      log_out:"Are you sure you want to log out?",
      Event_Logs:"Event Log Details",
      profile: "Profile",
      no_profile: "No profile yet. Please add a profile first.",
      Pending: "Pending",
      Acknowledged: "Acknowledged",
      compared_to_the_previous_day: "Compared to the previous day: ",
      Error_trends_over_time: "Error trends over time",
      Distribution_by_error_type: "Distribution by error type",
      Day: "Day",
      Week: "Week",
      Month: "Month",
      day: {
        sun: 'Sunday',  mon: 'Monday',  tue: 'Tuesday',
        wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday'
      },
      weekLabel: 'Week {num}',
      chart: { alarms: 'Alarms', pending: 'Pending', ack: 'Acknowledged' },
      search: "Search",
      no_shirt: "No Shirt",
      errors: {
        load_users: "Error loading users: ",
        forbidden: "You do not have permission to access this content.",
        unauthorized: "Your session has expired, please log in again.",
        unknown: "An error occurred while loading data.",
      },
      userManagement: {
        title: "User Management",
        description: "Functionality to add, edit, and delete users will be implemented here.",
        no_users: "No users found",
        add_user: "Add New User",
        loading: "Loading users...",
        config_access: "Config Access",
      },
      tagManagement: {
        title: "Tag Management",
        description: "Functionality to add, edit, and delete tags will be implemented here."
      }
    },
    vi: {
      FAISmart_Security: "An ninh thông minh",
      Status: "Trạng thái",
      Visitors: "Khách ra vào",
      Alarms: "Báo động",
      Violations: "Vi phạm",
      Resources: "Tài nguyên",
      LIVE_View: "Xem trực tiếp",
      Virtual_Tour: "Giả lập tham quan",
      Notifications:"Thông báo",
      Settings:"Cấu hình",
      Logout:"Đăng xuất",
      Event_Logs:"Nhật ký sự kiện",
      Filter_by_camera:"Tìm kiếm tên camera",
      Filter_by_ID:"Tìm kiếm tên ID",
      Filter_by_error_code:"Tìm kiếm mã lỗi",
      Filter_by_location:"Tìm kiếm tên vị trí",
      Cameras: "Camera",
      Tags: "Thẻ",
      Users: "Người Dùng",
      Add_New_Camera:"Thêm Mới Camera",
      Edit:"Sửa",
      delete:"Xóa",
      View_Details:"Xem chi tiết",
      log_out:"Đăng xuất tài khoản?",
      Event_Logs:"Nhật ký sự kiện",
      profile: "Thông tin người dùng",
      no_profile: "Chưa có thông tin người dùng!!!",
      Pending: "Chưa xử lý",
      Acknowledged: "Đã xử lý",
      compared_to_the_previous_day: "So sánh với ngày hôm trước: ",
      Error_trends_over_time: "Xu hướng lỗi theo thời gian",
      Distribution_by_error_type: "Thống kê theo loại lỗi",
      Day: "Ngày",
      Week: "Tuần",
      Month: "Tháng",
      day: {
        sun: 'Chủ nhật',  mon: 'Thứ 2',  tue: 'Thứ 3',
        wed: 'Thứ 4', thu: 'Thứ 5', fri: 'Thứ 6', sat: 'Thứ 7'
      },
      weekLabel: 'Tuần {num}',
      chart: { alarms: 'Lỗi', pending: 'Chờ xử lý', ack: 'Đã xác nhận' },
      search: "Tìm kiếm",
      no_shirt: "Không mặc áo tĩnh điện",
      errors: {
        forbidden: "Bạn không có quyền thao tác vào nội dung này.",
        unauthorized: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.",
        load_users: "Lỗi khi tải danh sách người dùng:",
        unknown: "Đã xảy ra lỗi khi tải dữ liệu.",
      },
      userManagement: {
        title: "Quản lý người dùng",
        description: "Chức năng thêm, sửa, xóa người dùng sẽ được triển khai tại đây.",
        no_users: "Không tìm thấy người dùng nào. Hãy thêm mới!"
      },
      tagManagement: {
        title: "Quản lý thẻ",
        description: "Chức năng thêm, sửa, xóa thẻ sẽ được triển khai tại đây."
      }
    },
    zh: {
      FAISmart_Security: "智能安防",
      Status:"状态",
      Visitors:"访客",
      Alarms:"警报",
      Violations:"违规",
      Resources:"资源",
      LIVE_View: "实时视图",
      Virtual_Tour: "虚拟导览",
      Notifications:"通知",
      Settings:"设置",
      Logout:"登出",
      Event_Logs:"事件日志",
      Filter_by_camera:"按摄像头过滤",
      Filter_by_ID:"按ID过滤",
      Filter_by_error_code:"按错误码过滤",
      Filter_by_location:"按位置过滤",
      Cameras: "摄像头",
      Tags: "标签",
      Users: "用户",
      Add_New_Camera:"添加新摄像头",
      Edit:"编辑",
      delete:"删除",
      View_Details:"查看详情",
      log_out:"确定要登出吗?",
      Event_Logs:"事件日志",
      profile: "用户信息",
      no_profile: "还没有用户信息，请先添加用户信息。",
      Pending: "待处理",
      Acknowledged: "已处理",
      compared_to_the_previous_day: "与前一天比较: ",
      Error_trends_over_time: "错误趋势",
      Distribution_by_error_type: "按错误类型分布 ",
      Day: "日",
      Week: "周",
      Month: "月",
      search: "搜索",
      no_shirt: "未穿戴静电衣",
      errors: {
      forbidden: "您没有权限访问此内容。",
      unauthorized: "您的会话已过期，请重新登录。",
      load_users: "加载用户时出错:",
      unknown: "加载数据时出错。",
    },
    userManagement: {
      title: "用户管理",
      description: "这里将实现添加、编辑和删除用户的功能。",
      no_users: "未找到用户，请新增！"
    },
    tagManagement: {
      title: "标签管理",
      description: "这里将实现添加、编辑和删除标签的功能。"
    }
    }
  }
});

const app = createApp(App)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
})

app.use(createPinia())
app.use(router)
app.use(i18n);

app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')
