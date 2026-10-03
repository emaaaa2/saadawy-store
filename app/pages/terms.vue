<template>
  <LegalPage title="الشروط والأحكام" :updated="UPDATED">
    <section>
      <p>
        أهلًا بيك في سعداوي ستور. استخدامك للموقع أو طلبك منه معناه موافقتك على الشروط دي،
        فياريت تقراها قبل ما تطلب.
      </p>
      <p v-if="settings.address">
        <strong>عنوان المتجر:</strong> {{ settings.address }}
      </p>
    </section>

    <section>
      <h2>المنتجات والأسعار</h2>
      <ul>
        <li>كل الأسعار بالجنيه المصري، والسعر المعتمد هو السعر وقت تأكيد الطلب.</li>
        <li>الصور للتوضيح، وممكن يكون فيه اختلاف بسيط في اللون حسب إضاءة التصوير وشاشة جهازك.</li>
        <li>الكميات محدودة حسب المخزون المتاح.</li>
      </ul>
    </section>

    <section>
      <h2>الطلبات</h2>
      <ul>
        <li>بعد ما تأكد طلبك بيوصلك رقم طلب يبدأ بـ SDW، تقدر تتابع بيه طلبك من صفحة <NuxtLink to="/track-order">تتبع الطلب</NuxtLink>.</li>
        <li>ممكن نتواصل معاك على واتساب أو التليفون لتأكيد الطلب والعنوان قبل الشحن.</li>
        <li>من حقنا نلغي الطلب لو المنتج خلص أو حصل خطأ واضح في السعر أو البيانات، وفي الحالة دي بنبلغك ونرجعلك أي مبلغ دفعته بالكامل.</li>
      </ul>
    </section>

    <section>
      <h2>طرق الدفع</h2>
      <ul>
        <li v-if="settings.paymentMethods.cash_on_delivery">كاش عند الاستلام: بتدفع للمندوب لما الطلب يوصلك.</li>
        <li v-if="settings.paymentMethods.bank_transfer">تحويل بنكي أو فودافون كاش: بتحوّل المبلغ وتبعتلنا صورة التحويل على واتساب، وبنجهز الطلب بعد ما التحويل يوصل.</li>
        <li v-if="settings.paymentMethods.card">الدفع بالكارت: من خلال صفحة الدفع الآمنة الخاصة بـ Paymob.</li>
      </ul>
    </section>

    <section>
      <h2>الشحن والتوصيل</h2>
      <ul>
        <li>بنوصّل لكل محافظات مصر، ومصاريف الشحن بتختلف حسب المحافظة وبتظهرلك قبل تأكيد الطلب.</li>
        <li v-if="freeShippingOver">الشحن مجاني للطلبات من {{ freeShippingOver.toLocaleString('en-US') }} جنيه وأكتر (بعد خصم الكوبون).</li>
        <li v-if="settings.deliveryTime">مدة التوصيل المتوقعة: {{ settings.deliveryTime }}.</li>
        <li>لازم يكون العنوان ورقم الموبايل صح عشان الطلب يوصل في ميعاده.</li>
      </ul>
    </section>

    <section>
      <h2>كوبونات الخصم</h2>
      <ul>
        <li>كل كوبون له شروطه، زي الحد الأدنى للطلب أو تاريخ الانتهاء أو عدد مرات الاستخدام.</li>
        <li>الكوبون لا يُستبدل بفلوس.</li>
      </ul>
    </section>

    <section>
      <h2>الاستبدال والاسترجاع</h2>
      <p>تفاصيل الاستبدال والاسترجاع موجودة في <NuxtLink to="/returns">سياسة الاستبدال والاسترجاع</NuxtLink>.</p>
    </section>

    <section>
      <h2>الحساب والتقييمات</h2>
      <ul>
        <li>تقدر تشتري كضيف من غير حساب، أو تسجّل دخول بجوجل عشان تشوف كل طلباتك في مكان واحد.</li>
        <li>التقييمات بتتراجع قبل ما تظهر، ومن حقنا منعرضش أي تقييم فيه إساءة أو محتوى مش مناسب.</li>
      </ul>
    </section>

    <section>
      <h2>الخصوصية</h2>
      <p>إزاي بنتعامل مع بياناتك موضح في <NuxtLink to="/privacy">سياسة الخصوصية</NuxtLink>.</p>
    </section>

    <section>
      <h2>القانون المطبق</h2>
      <p>الشروط دي بتخضع لقوانين جمهورية مصر العربية.</p>
    </section>

    <section>
      <h2>التعديلات على الشروط</h2>
      <p>ممكن نحدّث الشروط دي من وقت للتاني، والنسخة المنشورة وقت طلبك هي اللي بتطبق عليه.</p>
    </section>
  </LegalPage>
</template>

<script setup>
const UPDATED = '3 أكتوبر 2026'
const settings = useStoreSettings()

const { data: shippingSettings } = await useFetch('/api/shipping-settings', { key: 'shipping-settings' })
const freeShippingOver = computed(() => Number(shippingSettings.value?.free_shipping_threshold) || 0)

useSeoMeta({
  title: 'الشروط والأحكام',
  description: 'شروط الطلب والدفع والشحن والكوبونات في سعداوي ستور.',
})
</script>
