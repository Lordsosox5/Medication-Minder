import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Platform,
  Linking,
  Modal,
} from "react-native";
import Constants from "expo-constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import Colors from "@/constants/colors";
import { t } from "@/constants/i18n";
import { useApp, type ThemeMode, type AppSettings } from "@/context/AppContext";

export default function SettingsScreen() {
  const { settings, isDark, updateSettings, sendTestNotification } = useApp();
  const C = isDark ? Colors.dark : Colors.light;
  const lang = settings.language;
  const isRTL = lang === "ar";
  const insets = useSafeAreaInsets();
  const fontBold = isRTL ? "Tajawal_700Bold" : "Inter_700Bold";
  const fontMed = isRTL ? "Tajawal_500Medium" : "Inter_500Medium";
  const fontReg = isRTL ? "Tajawal_400Regular" : "Inter_400Regular";

  const webTopPadding = Platform.OS === "web" ? 67 : 0;
  const webBottomPadding = Platform.OS === "web" ? 34 : 0;

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";
  const [termsVisible, setTermsVisible] = React.useState(false);
  const [privacyVisible, setPrivacyVisible] = React.useState(false);

  const termsContent =
    lang === "ar"
      ? [
          { type: "title", text: "شروط الخدمة" },
          { type: "meta", text: "تاريخ التحديث: 2026-08-12" },
          { type: "body", text: "مرحبًا بك في " + "Tabira" + " (" + "التطبيق" + ")" },
          { type: "body", text: "تُحكم هذه الشروط استخدامك لتطبيق Tabira المحمول. باستخدامك للتطبيق أو الوصول إليه أو تنزيله، فإنك توافق على هذه الشروط." },
          { type: "body", text: "إذا كنت لا توافق على هذه الشروط، يُرجى عدم استخدام التطبيق." },
          { type: "section", text: "1. حول تطبيق Tabira" },
          { type: "body", text: "Tabira هو تطبيق لتذكير الأدوية وتنظيمها يساعد المستخدمين على تنظيم جداول أدويةهم واستقبال التنبيهات." },
          { type: "body", text: "يُستخدم Tabira فقط كأداة شخصية لتنظيم الأدوية والتذكير بها." },
          { type: "body", text: "Tabira ليس خدمة طبية ولا يقدم نصائح طبية أو تشخيصات أو علاجًا أو خدمات طبية طارئة." },
          { type: "section", text: "2. إخلاء مسؤولية طبية" },
          { type: "body", text: "لا يحل Tabira محل الطبيب أو الصيدلي أو أي أخصائي صحي مؤهل." },
          { type: "body", text: "يجب دائمًا اتباع تعليمات مقدم الرعاية الصحية فيما يخص أدويتك." },
          { type: "body", text: "لا تبدأ أو توقف أو تغير أو تعدل أي دواء أو جرعة بناءً على معلومات أو تذكيرات مقدمة من Tabira فقط." },
          { type: "body", text: "إذا كانت لديك أسئلة حول دوائك أو جرعته أو علاجه أو حالتك الصحية، استشر متخصصًا صحيًا مؤهلاً." },
          { type: "body", text: "في حالة الطوارئ الطبية، اطلب العناية الطبية الفورية أو اتصل بخدمات الطوارئ المحلية." },
          { type: "section", text: "3. معلومات الأدوية" },
          { type: "body", text: "يسمح لك Tabira بإدخال وإدارة معلومات متعلقة بالأدوية مثل أسماء الأدوية والجرعات والجداول وأوقات التذكير." },
          { type: "body", text: "أنت مسؤول عن التأكد من أن المعلومات التي تدخلها في التطبيق دقيقة." },
          { type: "body", text: "لا يتحقق Tabira بشكل مستقل من معلومات الأدوية التي يضيفها المستخدمون." },
          { type: "section", text: "4. التنبيهات والتذكير" },
          { type: "body", text: "قد يوفر Tabira تذكيرات وإشعارات حول الأدوية بناءً على المعلومات والجداول التي تحددها." },
          { type: "body", text: "ومع ذلك، قد تفشل الإشعارات أحيانًا أو تتأخر أو تتأثر بإعدادات جهازك أو نظام التشغيل أو توفير البطارية أو أذونات الإشعارات أو ظروف تقنية أخرى." },
          { type: "body", text: "لا تعتمد بشكل حصري على Tabira للحصول على أدوية أو علاج يحتاج إلى وقت حاسم." },
          { type: "section", text: "5. البيانات والخصوصية" },
          { type: "body", text: "تم تصميم Tabira لتقليل جمع معلومات المستخدمين." },
          { type: "body", text: "لا يجمع التطبيق أو يبيع أو يشارك معلوماتك الشخصية لأغراض إعلانية." },
          { type: "body", text: "المعلومات التي تدخلها في Tabira لإدارة الأدوية مخصصة لتقديم وظائف التطبيق." },
          { type: "body", text: "قد يستخدم Tabira Google Analytics أو تقنيات تحليلية مشابهة لفهم كيفية استخدام التطبيق، وتحديد المشكلات التقنية، وتحسينه." },
          { type: "body", text: "قد تجمع Google Analytics معلومات فنية واستخدام معينة وفقًا لسياسات Google وتكوين خدمة التحليلات." },
          { type: "body", text: "لمزيد من المعلومات، راجع سياسة الخصوصية الخاصة بنا." },
          { type: "section", text: "6. الإعلانات" },
          { type: "body", text: "إذا كان Tabira يعرض إعلانات، فقد تجمع خدمات الإعلانات معلومات معينة وفقًا لسياساتها الخاصة والخيارات المتاحة." },
          { type: "body", text: "لا يبيع Tabira معلوماتك الشخصية للمعلنين." },
          { type: "section", text: "7. الخدمات الخارجية" },
          { type: "body", text: "قد يستخدم Tabira خدمات خارجية، بما في ذلك Google Analytics وخدمات أخرى مطلوبة لتشغيل التطبيق أو تحسينه." },
          { type: "body", text: "تعمل هذه الخدمات الخارجية بموجب شروطها وسياساتها الخاصة بالخصوصية." },
          { type: "section", text: "8. الملكية الفكرية" },
          { type: "body", text: "تطبيق Tabira، بما في ذلك البرمجيات والتصميم والرسومات والشعارات والعلامات التجارية والمحتوى الأصلي، مملوك أو مرخص لـ Tabira Labs ويحميه القوانين المعمول بها في مجال الملكية الفكرية." },
          { type: "body", text: "لا يجوز لك نسخ التطبيق أو تعديله أو توزيعه أو هندسته العكسية أو استغلاله تجاريًا إلا إذا أذن بذلك القانون المعمول به." },
          { type: "section", text: "9. التوفر" },
          { type: "body", text: "نحن نبذل جهودًا معقولة للحفاظ على توفر Tabira وعمله بشكل صحيح. ومع ذلك، لا نضمن أن التطبيق سيكون متاحًا دائمًا أو دون انقطاع أو أخطاء أو مشاكل تقنية." },
          { type: "body", text: "قد نقوم بتحديث أو تعديل أو تعليق أو إيقاف بعض مميزات التطبيق في أي وقت." },
          { type: "section", text: "10. إخلاء مسؤولية الضمان" },
          { type: "body", text: "إلى أقصى حد يسمح به القانون، يُقدم Tabira على أساس \"كما هو\" و\"كما هو متاح\"." },
          { type: "body", text: "لا نضمن أن التطبيق يلبي كل متطلبات المستخدمين أو أن التذكيرات والإشعارات ستعمل دائمًا دون انقطاع أو فشل." },
          { type: "section", text: "11. تحديد المسؤولية" },
          { type: "body", text: "إلى أقصى حد يسمح به القانون، لا تكون Tabira Labs ومطوروها مسؤولين عن الأضرار الناتجة عن استخدام التطبيق أو عدم القدرة على استخدامه." },
          { type: "body", text: "ويشمل ذلك، حيثما كان ذلك قانونيًا مسموحًا، العواقب الناتجة عن إشعارات مفقودة أو متأخرة أو فاشلة أو معلومات غير دقيقة يضيفها المستخدم أو الاعتماد على التطبيق لأغراض طبية." },
          { type: "body", text: "لا شيء في هذه الشروط يستبعد المسؤولية التي لا يجوز استبعادها بموجب القانون المعمول به." },
          { type: "section", text: "12. التغييرات على هذه الشروط" },
          { type: "body", text: "قد نقوم بتحديث هذه الشروط من وقت لآخر." },
          { type: "body", text: "إذا أجرينا تغييرات جوهرية، فقد نُعلمك من خلال التطبيق أو بأي طريقة مناسبة." },
          { type: "body", text: "يعني استمرار استخدامك لـ Tabira بعد سريان الشروط المحدثة قبولك لها." },
          { type: "section", text: "13. الإنهاء" },
          { type: "body", text: "يمكنك التوقف عن استخدام Tabira في أي وقت." },
          { type: "body", text: "قد نقيد الوصول إلى التطبيق أو نوقفه إذا لزم الأمر لحماية التطبيق أو مستخدميه أو حقوقنا، أو إذا تم انتهاك هذه الشروط." },
          { type: "section", text: "14. تواصل معنا" },
          { type: "body", text: "إذا كانت لديك أسئلة أو مخاوف أو طلبات بشأن هذه الشروط، يرجى التواصل معنا:" },
          { type: "body", text: "التطبيق: Tabira" },
          { type: "body", text: "المطور: Tabira Labs" },
          { type: "body", text: "البريد الإلكتروني: Contact@tabira.xyz" },
          { type: "section", text: "15. قبول هذه الشروط" },
          { type: "body", text: "بإستخدامك لـ Tabira، فإنك تقر بأنك قرأت وفهمت ووافقت على شروط الخدمة هذه." },
          { type: "meta", text: "تاريخ النفاذ: 2026-08-12" },
        ]
      : [
          { type: "title", text: "Terms of Service" },
          { type: "meta", text: "Last Updated: 2026-08-12" },
          { type: "body", text: "Welcome to Tabira (the App, we, us, or our)." },
          { type: "body", text: "These Terms of Service (\"Terms\") govern your use of the Tabira mobile application. By downloading, accessing, or using Tabira, you agree to these Terms." },
          { type: "body", text: "If you do not agree with these Terms, please do not use the App." },
          { type: "section", text: "1. About Tabira" },
          { type: "body", text: "Tabira is a medication reminder and medication organization application designed to help users organize their medication schedules and receive reminders." },
          { type: "body", text: "Tabira is intended solely as a personal organization and reminder tool." },
          { type: "body", text: "Tabira is not a medical service and does not provide medical advice, diagnosis, treatment, or emergency medical services." },
          { type: "section", text: "2. Medical Disclaimer" },
          { type: "body", text: "Tabira does not replace a doctor, pharmacist, or other qualified healthcare professional." },
          { type: "body", text: "You should always follow the instructions provided by your healthcare professional regarding your medications." },
          { type: "body", text: "Do not start, stop, change, or modify a medication or dosage based solely on information or reminders provided by Tabira." },
          { type: "body", text: "If you have questions about your medication, dosage, treatment, or health condition, consult a qualified healthcare professional." },
          { type: "body", text: "In the event of a medical emergency, seek immediate medical attention or contact your local emergency services." },
          { type: "section", text: "3. Medication Information" },
          { type: "body", text: "Tabira allows you to enter and manage medication-related information, such as medication names, dosages, schedules, and reminder times." },
          { type: "body", text: "You are responsible for ensuring that the information you enter into the App is accurate." },
          { type: "body", text: "Tabira does not independently verify the medication information entered by users." },
          { type: "section", text: "4. Notifications and Reminders" },
          { type: "body", text: "Tabira may provide medication reminders and notifications based on the information and schedules you configure." },
          { type: "body", text: "However, notifications may occasionally fail to appear, be delayed, or be affected by your device settings, operating system, battery optimization, notification permissions, or other technical circumstances." },
          { type: "body", text: "You should not rely solely on Tabira for time-critical medication or medical treatment." },
          { type: "section", text: "5. Data and Privacy" },
          { type: "body", text: "Tabira is designed to minimize the collection of user information." },
          { type: "body", text: "Tabira does not directly collect, sell, or share your personal information for advertising purposes." },
          { type: "body", text: "Information entered into Tabira for managing medications is intended to provide the App's functionality." },
          { type: "body", text: "Tabira may use Google Analytics or related analytics technologies to understand how the App is used, identify technical issues, and improve the App." },
          { type: "body", text: "Google Analytics may collect certain technical and usage information according to Google's policies and the configuration of the analytics service." },
          { type: "body", text: "For more information, please review our Privacy Policy." },
          { type: "section", text: "6. Advertising" },
          { type: "body", text: "If Tabira displays advertisements, advertising services may collect certain information in accordance with their own privacy policies and applicable settings." },
          { type: "body", text: "Tabira does not sell your personal information to advertisers." },
          { type: "section", text: "7. Third-Party Services" },
          { type: "body", text: "Tabira may use third-party services, including Google Analytics and other services required to operate or improve the App." },
          { type: "body", text: "These third-party services operate under their own terms and privacy policies." },
          { type: "section", text: "8. Intellectual Property" },
          { type: "body", text: "The Tabira application, including its software, design, graphics, logos, trademarks, and original content, is owned by or licensed to Tabira Labs and is protected by applicable intellectual-property laws." },
          { type: "body", text: "You may not copy, modify, distribute, reverse engineer, or commercially exploit the App except as permitted by applicable law." },
          { type: "section", text: "9. Availability" },
          { type: "body", text: "We make reasonable efforts to keep Tabira available and functioning properly. However, we do not guarantee that the App will always be available, uninterrupted, error-free, or free from technical problems." },
          { type: "body", text: "We may update, modify, suspend, or discontinue features of the App at any time." },
          { type: "section", text: "10. Disclaimer of Warranties" },
          { type: "body", text: "To the maximum extent permitted by applicable law, Tabira is provided on an \"AS IS\" and \"AS AVAILABLE\" basis." },
          { type: "body", text: "We do not guarantee that the App will meet every user's requirements or that reminders and notifications will always function without interruption or failure." },
          { type: "section", text: "11. Limitation of Liability" },
          { type: "body", text: "To the maximum extent permitted by applicable law, Tabira Labs and its developers will not be responsible for damages arising from your use of, or inability to use, the App." },
          { type: "body", text: "This includes, where legally permitted, consequences resulting from missed, delayed, or failed notifications, inaccurate information entered by a user, or reliance on the App for medical purposes." },
          { type: "body", text: "Nothing in these Terms excludes liability that cannot legally be excluded under applicable law." },
          { type: "section", text: "12. Changes to These Terms" },
          { type: "body", text: "We may update these Terms from time to time." },
          { type: "body", text: "If we make significant changes, we may provide notice through the App or another appropriate method." },
          { type: "body", text: "Your continued use of Tabira after the updated Terms become effective means that you accept the updated Terms." },
          { type: "section", text: "13. Termination" },
          { type: "body", text: "You may stop using Tabira at any time." },
          { type: "body", text: "We may restrict or terminate access to the App if necessary to protect the App, its users, or our rights, or if these Terms are violated." },
          { type: "section", text: "14. Contact Us" },
          { type: "body", text: "If you have questions, concerns, or requests regarding these Terms, please contact us:" },
          { type: "body", text: "App: Tabira" },
          { type: "body", text: "Developer: Tabira Labs" },
          { type: "body", text: "Email: Contact@tabira.xyz" },
          { type: "section", text: "15. Acceptance of These Terms" },
          { type: "body", text: "By using Tabira, you acknowledge that you have read, understood, and agreed to these Terms of Service." },
          { type: "meta", text: "Effective Date: 2026-08-12" },
        ];

  const privacyContent =
    lang === "ar"
      ? [
          { type: "title", text: "سياسة الخصوصية" },
          { type: "meta", text: "تاريخ التحديث: 2026-08-12" },
          { type: "body", text: "تعمل Tabira Labs (Tabira أو نحن أو لنا) على تطبيق Tabira المحمول." },
          { type: "body", text: "تشرح هذه السياسة الخصوصية كيفية التعامل مع المعلومات عند استخدام تطبيق Tabira." },
          { type: "body", text: "بستخدامك لـ Tabira، فإنك تقر بالممارسات الموضحة في هذه السياسة." },
          { type: "section", text: "1. المعلومات التي نجمعها" },
          { type: "body", text: "تم تصميم Tabira مع مراعاة الخصوصية وهدفه تقليل جمع المعلومات الشخصية." },
          { type: "section", text: "المعلومات التي تدخلها في التطبيق" },
          { type: "body", text: "يسمح لك Tabira بإدخال معلومات مرتبطة بأدويتك وتذكيرك بها، وقد تشمل:" },
          { type: "body", text: "- أسماء الأدوية\n- الجرعات\n- جداول الأدوية\n- أوقات التذكير\n- ملاحظات الأدوية أو معلومات أخرى تختار إدخالها" },
          { type: "body", text: "تُستخدم هذه المعلومات لتوفير ميزات تذكير الأدوية وتنظيمها داخل التطبيق." },
          { type: "body", text: "لا تجمع Tabira Labs أو تستقبل هذه المعلومات الطبية عن قصد على خوادمها الخاصة ما لم يتم الإشارة إلى ذلك صراحةً في نسخة مستقبلية من التطبيق." },
          { type: "body", text: "حيث يتم تخزين المعلومات محليًا على جهازك، تبقى على جهازك ولا تُرسل تلقائيًا إلى Tabira Labs." },
          { type: "section", text: "2. معلومات التحليلات" },
          { type: "body", text: "قد تستخدم Tabira Google Analytics لفهم كيفية تفاعل المستخدمين مع التطبيق ومساعدتنا على تحسين أدائه ووظائفه وتجربة المستخدم." },
          { type: "body", text: "قد تجمع Google Analytics معلومات تقنية واستخدام معينة عبر التطبيق، حسب تكوين خدمة التحليل." },
          { type: "body", text: "قد تشمل هذه المعلومات معلومات حول استخدام التطبيق أو معلومات الجهاز أو التقنية أو الأحداث أو التفاعلات داخل التطبيق." },
          { type: "body", text: "تقوم Google بمعالجة المعلومات التي تُجمع عبر خدماتها وفق سياساتها الخاصة." },
          { type: "body", text: "لمزيد من المعلومات، يرجى مراجعة سياسة الخصوصية الخاصة بـ Google: https://policies.google.com/privacy" },
          { type: "section", text: "3. كيفية استخدام المعلومات" },
          { type: "body", text: "يمكن استخدام المعلومات التي يتعامل معها Tabira لـ:" },
          { type: "body", text: "- توفير وظيفة تذكير الأدوية\n- تقديم وصيانة ميزات التطبيق\n- تحسين التطبيق\n- فهم كيفية استخدام التطبيق\n- تحديد المشكلات التقنية ومعالجتها\n- تحسين الأداء وتجربة المستخدم\n- الحفاظ على أمان التطبيق وموثوقيته" },
          { type: "body", text: "لا نبيع معلوماتك الشخصية." },
          { type: "section", text: "4. معلومات الأدوية" },
          { type: "body", text: "تم تصميم Tabira بشكل أساسي كأداة لتنظيم الأدوية وتذكيرها." },
          { type: "body", text: "تُستخدم معلومات الأدوية التي تدخلها لتوفير الوظيفة التي تطلبها." },
          { type: "body", text: "لا تتحقق Tabira Labs بشكل مستقل من دقة معلومات الأدوية التي يدخلها المستخدمون." },
          { type: "body", text: "أنت مسؤول عن التأكد من أن معلومات أدويةك دقيقة." },
          { type: "section", text: "5. الإشعارات" },
          { type: "body", text: "قد يستخدم Tabira إشعارات محلية لتقديم تذكيرات بالأدوية." },
          { type: "body", text: "قد تتم معالجة معلومات الإشعارات بواسطة نظام تشغيل جهازك لتسليمها." },
          { type: "body", text: "قد تتأثر تسليم الإشعارات بإعدادات الجهاز أو قيود نظام التشغيل أو توفير البطارية أو أذونات الإشعارات أو عوامل تقنية أخرى." },
          { type: "section", text: "6. مشاركة البيانات" },
          { type: "body", text: "لا تبيع Tabira Labs أو تستأجر معلوماتك الشخصية." },
          { type: "body", text: "قد نستخدم خدمات جهة خارجية، مثل Google Analytics، لتقديم التحليل وتحسين التطبيق." },
          { type: "body", text: "قد تعالج الخدمات الخارجية المعلومات وفق سياساتها الخاصة وعباراتها." },
          { type: "body", text: "قد نكشف عن المعلومات أيضًا عندما يطلب ذلك القانون المعمول به أو الإجراءات القانونية أو السلطة الحكومية." },
          { type: "section", text: "7. تخزين البيانات" },
          { type: "body", text: "تم تصميم Tabira لتقليل نقل معلومات المستخدمين." },
          { type: "body", text: "حيث يتم تخزين معلومات الأدوية والتذكير محليًا على جهازك، لا تملك Tabira Labs إمكانية الوصول المباشر إليها." },
          { type: "body", text: "أنت مسؤول عن حماية الوصول إلى جهازك." },
          { type: "body", text: "إذا قدّمت إصدارات مستقبلية من Tabira تخزينًا سحابيًا أو حسابات أو مزامنة أو ميزات أخرى لمعالجة البيانات، فقد يتم تحديث سياسة الخصوصية وفقًا لذلك." },
          { type: "section", text: "8. أمن البيانات" },
          { type: "body", text: "نحن نتخذ تدابير معقولة لحماية المعلومات المرتبطة بالتطبيق." },
          { type: "body", text: "ومع ذلك، لا يمكن ضمان أنظمة التخزين الإلكتروني أو النقل الإلكتروني أن تكون آمنة بالكامل." },
          { type: "body", text: "يجب عليك استخدام تدابير أمان مناسبة على جهازك، بما في ذلك قفل الجهاز الآمن أو طريقة مصادقة." },
          { type: "section", text: "9. خصوصية الأطفال" },
          { type: "body", text: "لا يُوجّه Tabira خصيصًا للأطفال." },
          { type: "body", text: "لا نجمع بشكل متعمد معلومات شخصية مباشرة من الأطفال." },
          { type: "body", text: "إذا كنت تعتقد أن طفلًا قد قدّم معلومات شخصية لنا، يرجى الاتصال بنا على: Woditechs@gmail.com" },
          { type: "section", text: "10. الخدمات الخارجية" },
          { type: "body", text: "قد يستخدم Tabira خدمات خارجية، بما في ذلك Google Analytics." },
          { type: "body", text: "يُستخدم Google Analytics لمساعدتنا على فهم استخدام التطبيق وتحسين Tabira." },
          { type: "body", text: "قد تجمع الخدمات الخارجية أو تعالج المعلومات وفق سياساتها الخاصة بالخصوصية." },
          { type: "body", text: "نشجعك على مراجعة سياسات الخصوصية الخاصة بأي خدمات خارجية يستخدمها التطبيق." },
          { type: "section", text: "11. خيارات الخصوصية" },
          { type: "body", text: "اعتمادًا على جهازك والقوانين المعمول بها، قد تكون قادرًا على التحكم في بعض الأذونات وجمع البيانات من خلال إعدادات جهازك." },
          { type: "body", text: "يمكنك أيضًا التوقف عن استخدام Tabira أو إلغاء تثبيت التطبيق في أي وقت." },
          { type: "body", text: "إذا تم تخزين المعلومات محليًا على جهازك، فقد يؤدي إلغاء تثبيت التطبيق إلى حذف هذه المعلومات المخزنة محليًا." },
          { type: "section", text: "12. معالجة البيانات دوليًا" },
          { type: "body", text: "قد تعالج الخدمات الخارجية المستخدمة من قبل Tabira، بما في ذلك Google Analytics، المعلومات في دول أخرى غير الدولة التي تقيم فيها." },
          { type: "body", text: "تخضع هذه المعالجة للسياسات والحماية المعمول بها لدى مزودي الخدمة المعنيين والقانون المعمول به." },
          { type: "section", text: "13. التغييرات على سياسة الخصوصية" },
          { type: "body", text: "قد نقوم بتحديث هذه السياسة من وقت لآخر لتعكس التغييرات في Tabira أو ممارساتنا أو المتطلبات القانونية المعمول بها." },
          { type: "body", text: "عند إجراء تغييرات، سنقوم بتحديث تاريخ آخر تحديث في بداية هذه السياسة." },
          { type: "body", text: "يعني استمرار استخدامك لـ Tabira بعد سريان سياسة الخصوصية المحدثة قبولك لهذه السياسة المحدثة." },
          { type: "section", text: "14. تواصل معنا" },
          { type: "body", text: "إذا كانت لديك أسئلة أو مخاوف أو طلبات بشأن هذه السياسة، يرجى التواصل معنا:" },
          { type: "body", text: "التطبيق: Tabira" },
          { type: "body", text: "المطور: Tabira Labs" },
          { type: "body", text: "البريد الإلكتروني: Contact@tabira.xyz" },
          { type: "section", text: "15. الموافقة" },
          { type: "body", text: "بإستخدامك لـ Tabira، فإنك تقر بأنك قرأت وفهمت هذه السياسة ووافقت على الممارسات المذكورة فيها." },
          { type: "meta", text: "تاريخ النفاذ: 2026-08-12" },
        ]
      : [
          { type: "title", text: "Privacy Policy" },
          { type: "meta", text: "Last Updated: 2026-08-12" },
          { type: "body", text: "Tabira Labs (\"Tabira\", \"we\", \"us\", or \"our\") operates the Tabira mobile application." },
          { type: "body", text: "This Privacy Policy explains how information is handled when you use the Tabira application." },
          { type: "body", text: "By using Tabira, you acknowledge the practices described in this Privacy Policy." },
          { type: "section", text: "1. Information We Collect" },
          { type: "body", text: "Tabira is designed with privacy in mind and aims to minimize the collection of personal information." },
          { type: "section", text: "Information You Enter Into the App" },
          { type: "body", text: "Tabira allows you to enter information related to your medications and reminders, which may include:" },
          { type: "body", text: "- Medication names\n- Dosages\n- Medication schedules\n- Reminder times\n- Medication notes or other information you choose to enter" },
          { type: "body", text: "This information is used to provide the medication reminder and organization features of the App." },
          { type: "body", text: "Tabira Labs does not intentionally collect or receive this medication information on its own servers unless explicitly stated otherwise in a future version of the App." },
          { type: "body", text: "Where information is stored locally on your device, it remains on your device and is not automatically transmitted to Tabira Labs." },
          { type: "section", text: "2. Analytics Information" },
          { type: "body", text: "Tabira may use Google Analytics to understand how users interact with the App and to help us improve its performance, functionality, and user experience." },
          { type: "body", text: "Google Analytics may collect certain technical and usage information through the App, depending on the configuration of the analytics service." },
          { type: "body", text: "This information may include information about App usage, device or technical information, and events or interactions within the App." },
          { type: "body", text: "Google processes information collected through its services according to its own policies." },
          { type: "body", text: "For more information, please review Google's privacy policy: https://policies.google.com/privacy" },
          { type: "section", text: "3. How We Use Information" },
          { type: "body", text: "Information handled by Tabira may be used to:" },
          { type: "body", text: "- Provide medication reminder functionality\n- Provide and maintain App features\n- Improve the App\n- Understand how the App is used\n- Identify and troubleshoot technical problems\n- Improve performance and user experience\n- Maintain the security and reliability of the App" },
          { type: "body", text: "We do not sell your personal information." },
          { type: "section", text: "4. Medication Information" },
          { type: "body", text: "Tabira is designed primarily as a medication organization and reminder tool." },
          { type: "body", text: "Medication information entered by you is used to provide the functionality you request." },
          { type: "body", text: "Tabira Labs does not independently verify the accuracy of medication information entered by users." },
          { type: "body", text: "You are responsible for ensuring that your medication information is accurate." },
          { type: "section", text: "5. Notifications" },
          { type: "body", text: "Tabira may use local notifications to provide medication reminders." },
          { type: "body", text: "Notification information may be processed by your device's operating system in order to deliver notifications." },
          { type: "body", text: "Notification delivery may be affected by device settings, operating-system restrictions, battery optimization, notification permissions, or other technical factors." },
          { type: "section", text: "6. Data Sharing" },
          { type: "body", text: "Tabira Labs does not sell or rent your personal information." },
          { type: "body", text: "We may use third-party services, such as Google Analytics, to provide analytics and improve the App." },
          { type: "body", text: "Third-party services may process information according to their own privacy policies and terms." },
          { type: "body", text: "We may also disclose information where required by applicable law, legal process, or governmental authority." },
          { type: "section", text: "7. Data Storage" },
          { type: "body", text: "Tabira is designed to minimize the transmission of user information." },
          { type: "body", text: "Where medication and reminder information is stored locally on your device, Tabira Labs does not have direct access to that information." },
          { type: "body", text: "You are responsible for protecting access to your device." },
          { type: "body", text: "If future versions of Tabira introduce cloud storage, accounts, synchronization, or other data-processing features, this Privacy Policy may be updated accordingly." },
          { type: "section", text: "8. Data Security" },
          { type: "body", text: "We take reasonable measures to protect information associated with the App." },
          { type: "body", text: "However, no electronic storage or transmission system can be guaranteed to be completely secure." },
          { type: "body", text: "You should use appropriate security measures on your device, including a secure device lock or authentication method." },
          { type: "section", text: "9. Children's Privacy" },
          { type: "body", text: "Tabira is not specifically directed toward children." },
          { type: "body", text: "We do not knowingly collect personal information directly from children." },
          { type: "body", text: "If you believe that a child has provided personal information to us, please contact us at: Contact@tabira.xyz" },
          { type: "section", text: "10. Third-Party Services" },
          { type: "body", text: "Tabira may use third-party services, including: Google Analytics" },
          { type: "body", text: "Google Analytics is used to help us understand App usage and improve Tabira." },
          { type: "body", text: "Third-party services may collect or process information according to their own privacy policies." },
          { type: "body", text: "We encourage you to review the privacy policies of any third-party services used by the App." },
          { type: "section", text: "11. Your Privacy Choices" },
          { type: "body", text: "Depending on your device and applicable laws, you may be able to control certain permissions and data collection through your device settings." },
          { type: "body", text: "You may also stop using Tabira or uninstall the App at any time." },
          { type: "body", text: "If information is stored locally on your device, uninstalling the App may remove that locally stored information." },
          { type: "section", text: "12. International Data Processing" },
          { type: "body", text: "Third-party services used by Tabira, including Google Analytics, may process information in countries other than the country where you live." },
          { type: "body", text: "Such processing is subject to the applicable policies and safeguards of the relevant service providers and applicable law." },
          { type: "section", text: "13. Changes to This Privacy Policy" },
          { type: "body", text: "We may update this Privacy Policy from time to time to reflect changes to Tabira, our practices, or applicable legal requirements." },
          { type: "body", text: "When we make changes, we will update the Last Updated date at the beginning of this Privacy Policy." },
          { type: "body", text: "Your continued use of Tabira after an updated Privacy Policy becomes effective constitutes your acceptance of the updated policy." },
          { type: "section", text: "14. Contact Us" },
          { type: "body", text: "If you have questions, concerns, or requests regarding this Privacy Policy, please contact us:" },
          { type: "body", text: "App: Tabira" },
          { type: "body", text: "Developer: Tabira Labs" },
          { type: "body", text: "Email: Contact@tabira.xyz" },
          { type: "section", text: "15. Consent" },
          { type: "body", text: "By using Tabira, you acknowledge that you have read and understood this Privacy Policy and agree to the practices described in it." },
          { type: "meta", text: "Effective Date: 2026-08-12" },
        ];

  const update = async (patch: Partial<AppSettings>) => {
    Haptics.selectionAsync();
    await updateSettings({ ...settings, ...patch });
  };

const openBatterySettings = async () => {
  if (Platform.OS !== "android") {
    await Linking.openSettings();
    return;
  }

  try {
    const IntentLauncher = await import("expo-intent-launcher");
    const Application = await import("expo-application");

    const packageName = Application.applicationId;

    if (!packageName) {
      throw new Error("Application ID is unavailable");
    }

    // Try Android's battery optimization screen first.
    await IntentLauncher.startActivityAsync(
      "android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS"
    );
  } catch (error) {
    console.warn("Battery settings failed:", error);

    try {
      const IntentLauncher = await import("expo-intent-launcher");
      const Application = await import("expo-application");

      await IntentLauncher.startActivityAsync(
        "android.settings.APPLICATION_DETAILS_SETTINGS",
        {
          data: `package:${Application.applicationId}`,
        }
      );
    } catch {
      await Linking.openSettings();
    }
  }
};

const openNotificationSettings = async () => {
  if (Platform.OS !== "android") {
    await Linking.openSettings();
    return;
  }

  try {
    const IntentLauncher = await import("expo-intent-launcher");
    const Application = await import("expo-application");

    // Open Tabira's app notification settings page
    await IntentLauncher.startActivityAsync(
      "android.settings.APP_NOTIFICATION_SETTINGS",
      { data: `package:${Application.applicationId}` }
    );
  } catch (err) {
    try {
      // Fallback: Try opening the alarm channel specifically
      const IntentLauncher = await import("expo-intent-launcher");
      const Application = await import("expo-application");

      await IntentLauncher.startActivityAsync(
        "android.settings.CHANNEL_NOTIFICATION_SETTINGS",
        {
          data: `package:${Application.applicationId}`,
          extra: {
            "android.provider.extra.CHANNEL_ID": "alarm",
          },
        }
      );
    } catch (e) {
      await Linking.openSettings();
    }
  }
};
  const SectionHeader = ({ label }: { label: string }) => (
    <Text
      style={[
        styles.sectionHeader,
        {
          color: C.textMuted,
          fontFamily: fontMed,
          textAlign: isRTL ? "right" : "left",
        },
      ]}
    >
      {label}
    </Text>
  );

  const SettingRow = ({
    icon,
    label,
    value,
    right,
    onPress,
    showDivider = true,
  }: {
    icon: React.ReactNode;
    label: string;
    value?: string;
    right?: React.ReactNode;
    onPress?: () => void;
    showDivider?: boolean;
  }) => (
    <Pressable
      style={({ pressed }) => [
        styles.settingRow,
        isRTL && styles.rowReverse,
        { opacity: pressed && onPress ? 0.7 : 1 },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.settingRowLeft, isRTL && styles.rowReverse]}>
        <View style={[styles.settingIcon, { backgroundColor: C.primaryLight }]}> 
          {icon}
        </View>
        <View style={[{ flex: 1, minWidth: 0, maxWidth: '100%' }, isRTL && { alignItems: "flex-end" }]}> 
          <Text
            style={[
              styles.settingLabel,
              {
                color: C.text,
                fontFamily: fontMed,
                flexWrap: 'wrap',
                textAlign: isRTL ? 'right' : 'left',
                width: '100%',
              },
            ]}
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {label}
          </Text>
          {value && (
            <Text
              style={[
                styles.settingValue,
                {
                  color: C.textSecondary,
                  fontFamily: fontReg,
                  flexWrap: 'wrap',
                  textAlign: isRTL ? 'right' : 'left',
                  width: '100%',
                },
              ]}
              numberOfLines={3}
              ellipsizeMode="tail"
            >
              {value}
            </Text>
          )}
        </View>
      </View>
      {right && <View style={styles.settingRight}>{right}</View>}
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: C.surface,
            paddingTop: insets.top + 16 + webTopPadding,
            borderBottomColor: C.border,
          },
        ]}
      >
        <Text
          style={[
            styles.headerTitle,
            {
              color: C.text,
              fontFamily: fontBold,
              textAlign: isRTL ? "center" : "center",
            },
          ]}
        >
          {t("settingsTitle", lang)}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 100 + webBottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <SectionHeader label={t("appearance", lang)} />

          <SettingRow
            icon={<Feather name="sun" size={16} color={C.primary} />}
            label={t("theme", lang)}
            right={
              <View style={[styles.segmented, { backgroundColor: C.surfaceSecondary }]}>
                {(["light", "dark", "system"] as ThemeMode[]).map((m) => (
                  <Pressable
                    key={m}
                    style={[
                      styles.segment,
                      settings.themeMode === m && { backgroundColor: C.primary },
                    ]}
                    onPress={() => update({ themeMode: m })}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        {
                          color: settings.themeMode === m ? "#000" : C.textSecondary,
                          fontFamily: fontMed,
                        },
                      ]}
                    >
                      {m === "light"
                        ? t("lightMode", lang)
                        : m === "dark"
                          ? t("darkMode", lang)
                          : t("systemDefault", lang)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            }
          />

          <View style={[styles.divider, { backgroundColor: C.border }]} />

          <SettingRow
            icon={<Feather name="globe" size={16} color={C.primary} />}
            label={t("language", lang)}
            right={
              <View style={[styles.segmented, { backgroundColor: C.surfaceSecondary }]}>
                {(["en", "ar"] as const).map((l) => (
                  <Pressable
                    key={l}
                    style={[
                      styles.segment,
                      settings.language === l && { backgroundColor: C.primary },
                    ]}
                    onPress={() => update({ language: l })}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        {
                          color: settings.language === l ? "#000" : C.textSecondary,
                          fontFamily: l === "ar" ? "Tajawal_500Medium" : "Inter_500Medium",
                        },
                      ]}
                    >
                      {l === "en" ? "EN" : "عر"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            }
          />

          <View style={[styles.divider, { backgroundColor: C.border }]} />

          <SettingRow
            icon={<Feather name="clock" size={16} color={C.primary} />}
            label={t("timeFormat", lang)}
            right={
              <View style={[styles.segmented, { backgroundColor: C.surfaceSecondary }]}>
                {(["12h", "24h"] as const).map((fmt) => (
                  <Pressable
                    key={fmt}
                    style={[
                      styles.segment,
                      settings.timeFormat === fmt && { backgroundColor: C.primary },
                    ]}
                    onPress={() => update({ timeFormat: fmt })}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        {
                          color: settings.timeFormat === fmt ? "#000" : C.textSecondary,
                          fontFamily: fontMed,
                        },
                      ]}
                    >
                      {fmt === "12h" ? t("format12h", lang) : t("format24h", lang)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            }
          />
        </View>

        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <SectionHeader label={t("alarmSettings", lang)} />

          <SettingRow
            icon={<Feather name="bell" size={16} color={C.primary} />}
            label={t("persistentAlarm", lang)}
            value={t("persistentAlarmDesc", lang)}
            right={
              <Switch
                value={settings.persistentAlarm}
                onValueChange={(v) => update({ persistentAlarm: v })}
                trackColor={{ false: C.border, true: C.primary }}
                thumbColor={"#fff"}
              />
            }
          />

          <View style={[styles.divider, { backgroundColor: C.border }]} />

          <SettingRow
            icon={<Feather name="smartphone" size={16} color={C.primary} />}
            label={t("vibration", lang)}
            right={
              <Switch
                value={settings.vibration}
                onValueChange={(v) => update({ vibration: v })}
                trackColor={{ false: C.border, true: C.primary }}
                thumbColor={"#fff"}
              />
            }
          />
        </View>

        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <SectionHeader label={t("notifications", lang)} />
          <SettingRow
            icon={<Feather name="bell-off" size={16} color={C.primary} />}
            label={t("notifications", lang)}
            value={t("notificationsEnabled", lang)}
            right={
              <Pressable
                style={({ pressed }) => [
                  styles.openSettingsBtn,
                  { backgroundColor: C.primaryLight, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={openNotificationSettings}
              >
                <Text style={[styles.openSettingsBtnText, { color: C.primary, fontFamily: fontMed }]}>
                  {t("openSettings", lang)}
                </Text>
              </Pressable>
            }
          />

          <View style={[styles.divider, { backgroundColor: C.border }]} />


          <SettingRow
            icon={<Feather name="battery" size={16} color={C.primary} />}
            label={t("batteryOptimization", lang)}
            value={t("batteryOptimizationDesc", lang)}
            right={
              <Pressable
                style={({ pressed }) => [
                  styles.openSettingsBtn,
                  { backgroundColor: C.primaryLight, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={openBatterySettings}
              >
                <Text style={[styles.openSettingsBtnText, { color: C.primary, fontFamily: fontMed }]}> 
                  {t("openBatterySettings", lang)}
                </Text>
              </Pressable>
            }
          />
        </View>

        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}> 
          <SectionHeader label={t("about", lang)} />
          <View style={[styles.aboutRow, isRTL && styles.rowReverse]}> 
            <View style={[styles.aboutIcon, { backgroundColor: C.primaryLight }]}> 
              <MaterialCommunityIcons name="pill" size={24} color={C.primary} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}> 
              <Text style={[styles.aboutName, { color: C.text, fontFamily: fontMed, textAlign: isRTL ? "right" : "left" }]}> 
                {t("appName", lang)}
              </Text>
              <Text style={[styles.aboutDesc, { color: C.textSecondary, fontFamily: fontReg, textAlign: isRTL ? "right" : "left" }]}> 
                {t("description", lang)}
              </Text>
              <Text style={[styles.aboutDesc, { color: C.textMuted, fontFamily: fontReg, marginTop: 0, textAlign: isRTL ? "right" : "left" }]}> 
                {t("developer", lang)}: {t("developerName", lang)}
              </Text>
              <Text style={[styles.aboutVersion, { color: C.textMuted, fontFamily: fontReg, textAlign: isRTL ? "right" : "left" }]}> 
                {t("version", lang)} {appVersion}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: C.border }]} />

          <Pressable
            style={({ pressed }) => [
              styles.termsButton,
              { backgroundColor: C.primaryLight, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => setTermsVisible(true)}
          >
            <Feather name="file-text" size={16} color={C.primary} />
            <Text style={[styles.termsButtonText, { color: C.primary, fontFamily: fontMed }]}> 
              {t("termsOfService", lang)}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.termsButton,
              { backgroundColor: C.primaryLight, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => setPrivacyVisible(true)}
          >
            <Feather name="shield" size={16} color={C.primary} />
            <Text style={[styles.termsButtonText, { color: C.primary, fontFamily: fontMed }]}> 
              {t("privacyPolicy", lang)}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={termsVisible} transparent animationType="slide" onRequestClose={() => setTermsVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setTermsVisible(false)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: C.surface, borderColor: C.border }]} onPress={() => {}}>
            <View style={[styles.modalHeader, { borderBottomColor: C.border, justifyContent: "center" }]}> 
              <Text style={[styles.modalTitle, { color: C.text, fontFamily: fontBold, textAlign: "center", flex: 1 }]}> 
                {t("termsOfService", lang)}
              </Text>
              <Pressable onPress={() => setTermsVisible(false)} style={styles.closeButton}>
                <Text style={[styles.closeButtonText, { color: C.textMuted, fontFamily: fontMed }]}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalContent}
            >
              {termsContent.map((item, index) => {
                const alignment = (isRTL ? "right" : "left") as "right" | "left";
                const textStyle =
                  item.type === "title"
                    ? { ...styles.termsTitle, color: C.text, fontFamily: fontBold, textAlign: alignment }
                    : item.type === "section"
                      ? { ...styles.termsSection, color: C.text, fontFamily: fontMed, textAlign: alignment }
                      : item.type === "meta"
                        ? { ...styles.termsMeta, color: C.textMuted, fontFamily: fontMed, textAlign: alignment }
                        : { ...styles.termsBody, color: C.textSecondary, fontFamily: fontReg, textAlign: alignment };

                return (
                  <Text key={`${item.type}-${index}`} style={textStyle}>
                    {item.text}
                  </Text>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={privacyVisible} transparent animationType="slide" onRequestClose={() => setPrivacyVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPrivacyVisible(false)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: C.surface, borderColor: C.border }]} onPress={() => {}}>
            <View style={[styles.modalHeader, { borderBottomColor: C.border, justifyContent: "center" }]}> 
              <Text style={[styles.modalTitle, { color: C.text, fontFamily: fontBold, textAlign: "center", flex: 1 }]}> 
                {t("privacyPolicy", lang)}
              </Text>
              <Pressable onPress={() => setPrivacyVisible(false)} style={styles.closeButton}>
                <Text style={[styles.closeButtonText, { color: C.textMuted, fontFamily: fontMed }]}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalContent}
            >
              {privacyContent.map((item, index) => {
                const alignment = (isRTL ? "right" : "left") as "right" | "left";
                const textStyle =
                  item.type === "title"
                    ? { ...styles.termsTitle, color: C.text, fontFamily: fontBold, textAlign: alignment }
                    : item.type === "section"
                      ? { ...styles.termsSection, color: C.text, fontFamily: fontMed, textAlign: alignment }
                      : item.type === "meta"
                        ? { ...styles.termsMeta, color: C.textMuted, fontFamily: fontMed, textAlign: alignment }
                        : { ...styles.termsBody, color: C.textSecondary, fontFamily: fontReg, textAlign: alignment };

                return (
                  <Text key={`${item.type}-${index}`} style={textStyle}>
                    {item.text}
                  </Text>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 28, letterSpacing: -0.5 },
  content: { padding: 16, gap: 16 },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 12,
  },
  settingRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: { fontSize: 15 },
  settingValue: { fontSize: 12, marginTop: 1 },
  settingRight: { flexShrink: 0 },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 12 },
  segmented: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  segment: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentText: { fontSize: 12 },
  openSettingsBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  openSettingsBtnText: { fontSize: 13 },
  aboutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 12,
  },
  aboutIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  aboutName: { fontSize: 18 },
  aboutDesc: { fontSize: 13, marginTop: 2 },
  aboutVersion: { fontSize: 12, marginTop: 4 },
  termsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
  },
  termsButtonText: { fontSize: 14 },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalSheet: {
    maxHeight: "85%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  modalTitle: { fontSize: 20 },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: { fontSize: 18 },
  modalContent: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    paddingBottom: 36,
  },
  termsTitle: { fontSize: 24, marginBottom: 8 },
  termsSection: { fontSize: 18, marginTop: 16, marginBottom: 8 },
  termsMeta: { fontSize: 13, marginBottom: 10 },
  termsBody: { fontSize: 15, lineHeight: 24, marginBottom: 10 },
  rowReverse: { flexDirection: "row-reverse" },
});
