<template>
  <LegalPage :title="$t('policies.terms')" :updated="UPDATED">
    <template v-if="isAr">
      <section>
        <p>
          أهلًا بيك في سعداوي ستور. استخدامك للموقع أو طلبك منه معناه موافقتك على الشروط دي،
          فياريت تقراها قبل ما تطلب.
        </p>
        <p v-if="settingText('address')"><strong>عنوان المتجر:</strong> {{ settingText('address') }}</p>
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
          <li v-if="freeShippingOver">الشحن مجاني للطلبات من {{ price(freeShippingOver) }} وأكتر (بعد خصم الكوبون).</li>
          <li v-if="settingText('deliveryTime')">مدة التوصيل المتوقعة: {{ settingText('deliveryTime') }}.</li>
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
    </template>

    <template v-else>
      <section>
        <p>
          Welcome to Saadawy Store. By using our website or placing an order, you agree to these terms,
          so please read them before you order.
        </p>
        <p v-if="settingText('address')"><strong>Store address:</strong> {{ settingText('address') }}</p>
      </section>

      <section>
        <h2>Products and prices</h2>
        <ul>
          <li>All prices are in Egyptian pounds, and the price that applies is the one shown when you confirm your order.</li>
          <li>Photos are for illustration; colors may look slightly different depending on lighting and your screen.</li>
          <li>Quantities are limited to the stock available.</li>
        </ul>
      </section>

      <section>
        <h2>Orders</h2>
        <ul>
          <li>After you confirm your order you get an order number starting with SDW, which you can use on the <NuxtLink to="/track-order">Track Order</NuxtLink> page.</li>
          <li>We may contact you on WhatsApp or by phone to confirm your order and address before shipping.</li>
          <li>We may cancel an order if a product runs out or there's an obvious error in price or details; we'll let you know and refund anything you paid in full.</li>
        </ul>
      </section>

      <section>
        <h2>Payment methods</h2>
        <ul>
          <li v-if="settings.paymentMethods.cash_on_delivery">Cash on delivery: you pay the courier when your order arrives.</li>
          <li v-if="settings.paymentMethods.bank_transfer">Bank transfer or Vodafone Cash: you transfer the amount and send us the receipt on WhatsApp; we prepare your order once the transfer arrives.</li>
          <li v-if="settings.paymentMethods.card">Card: through Paymob's secure payment page.</li>
        </ul>
      </section>

      <section>
        <h2>Shipping and delivery</h2>
        <ul>
          <li>We deliver to every governorate in Egypt. Shipping fees depend on the governorate and are shown before you confirm your order.</li>
          <li v-if="freeShippingOver">Shipping is free on orders of {{ price(freeShippingOver) }} or more (after any coupon discount).</li>
          <li v-if="settingText('deliveryTime')">Expected delivery time: {{ settingText('deliveryTime') }}.</li>
          <li>Please make sure your address and phone number are correct so your order arrives on time.</li>
        </ul>
      </section>

      <section>
        <h2>Coupons</h2>
        <ul>
          <li>Each coupon has its own conditions, such as a minimum order, an expiry date, or a usage limit.</li>
          <li>Coupons can't be exchanged for cash.</li>
        </ul>
      </section>

      <section>
        <h2>Exchanges and returns</h2>
        <p>See our <NuxtLink to="/returns">Returns &amp; Exchanges policy</NuxtLink> for details.</p>
      </section>

      <section>
        <h2>Accounts and reviews</h2>
        <ul>
          <li>You can check out as a guest, or sign in with Google to see all your orders in one place.</li>
          <li>Reviews are checked before they appear, and we may decline any review that's abusive or inappropriate.</li>
        </ul>
      </section>

      <section>
        <h2>Privacy</h2>
        <p>How we handle your information is explained in our <NuxtLink to="/privacy">Privacy Policy</NuxtLink>.</p>
      </section>

      <section>
        <h2>Governing law</h2>
        <p>These terms are governed by the laws of the Arab Republic of Egypt.</p>
      </section>

      <section>
        <h2>Changes to these terms</h2>
        <p>We may update these terms from time to time; the version published when you place your order is the one that applies to it.</p>
      </section>
    </template>
  </LegalPage>
</template>

<script setup>
const UPDATED = '2026-10-03'
const settings = useStoreSettings()
const { t, isAr, price, settingText } = useLang()

const { data: shippingSettings } = await useFetch('/api/shipping-settings', { key: 'shipping-settings' })
const freeShippingOver = computed(() => Number(shippingSettings.value?.free_shipping_threshold) || 0)

useSeoMeta({
  title: () => t('policies.terms'),
  description: () => t('policies.termsMeta'),
})
</script>
