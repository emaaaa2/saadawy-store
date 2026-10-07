<template>
  <LegalPage :title="$t('policies.privacy')" :updated="UPDATED">
    <template v-if="isAr">
      <section>
        <p>
          في سعداوي ستور بنحترم خصوصيتك. الصفحة دي بتوضح البيانات اللي بنجمعها لما تستخدم الموقع أو تطلب منه،
          وبنستخدمها في إيه، ومين بيشوفها.
        </p>
      </section>

      <section>
        <h2>البيانات اللي بنجمعها</h2>
        <ul>
          <li><strong>بيانات الطلب:</strong> الاسم، رقم الموبايل، المحافظة والعنوان، والمنتجات اللي طلبتها.</li>
          <li><strong>لو سجلت دخول بجوجل:</strong> الاسم والإيميل وصورة الحساب، عشان نحفظلك طلباتك في حسابك. التسجيل اختياري وتقدر تشتري كضيف.</li>
          <li><strong>لو اشتركت في النشرة البريدية:</strong> إيميلك فقط.</li>
          <li><strong>لو كتبت تقييم:</strong> الاسم والمدينة والتقييم اللي كتبته، وبيظهروا على الموقع بعد مراجعتهم.</li>
          <li><strong>على جهازك:</strong> السلة والمفضلة وآخر المنتجات اللي شفتها واللغة اللي اخترتها بتتحفظ في متصفحك أنت، مش عندنا.</li>
        </ul>
      </section>

      <section>
        <h2>بنستخدمها في إيه</h2>
        <ul>
          <li>تنفيذ طلبك وتوصيله والتواصل معاك بخصوصه على واتساب أو التليفون.</li>
          <li>متابعة الاستبدال والاسترجاع وخدمة العملاء.</li>
          <li>إرسال العروض والمنتجات الجديدة على الإيميل، فقط لو اشتركت في النشرة.</li>
          <li>تحسين الموقع والخدمة.</li>
        </ul>
      </section>

      <section>
        <h2>بيانات الدفع</h2>
        <p>الدفع بالكارت بيتم بالكامل على صفحة الدفع الآمنة الخاصة بـ Paymob. إحنا لا نرى ولا نحفظ رقم الكارت أو أي بيانات بنكية خاصة بيك.</p>
      </section>

      <section>
        <h2>مين بيشوف بياناتك</h2>
        <ul>
          <li>شركة الشحن أو المندوب: الاسم والتليفون والعنوان، بالقدر اللازم لتوصيل الطلب.</li>
          <li>مقدمي الخدمات التقنية اللي بنعتمد عليهم لتشغيل الموقع (الاستضافة وقاعدة البيانات والدفع والإيميل).</li>
        </ul>
        <p><strong>إحنا لا نبيع بياناتك ولا نشاركها مع أي جهة للتسويق.</strong></p>
      </section>

      <section>
        <h2>حقوقك</h2>
        <ul>
          <li>تقدر تطلب نسخة من بياناتك، أو تعديلها، أو حذفها.</li>
          <li>تقدر تلغي الاشتراك في النشرة البريدية في أي وقت.</li>
        </ul>
        <p>
          لأي طلب من دول ابعتلنا على واتساب على
          <a :href="whatsappLink" target="_blank" rel="noopener noreferrer" dir="ltr">{{ settings.whatsappSupport }}</a>.
          ممكن نحتاج نحتفظ ببعض بيانات الطلبات القديمة لفترة لأسباب محاسبية.
        </p>
      </section>

      <section>
        <h2>التعديلات على السياسة</h2>
        <p>ممكن نحدّث السياسة دي من وقت للتاني، وتاريخ آخر تحديث بيكون مكتوب فوق الصفحة.</p>
      </section>
    </template>

    <template v-else>
      <section>
        <p>
          At Saadawy Store we respect your privacy. This page explains what information we collect when you use or
          order from our website, what we use it for, and who can see it.
        </p>
      </section>

      <section>
        <h2>What we collect</h2>
        <ul>
          <li><strong>Order details:</strong> your name, phone number, governorate and address, and the products you ordered.</li>
          <li><strong>If you sign in with Google:</strong> your name, email and profile picture, so we can keep your orders in your account. Signing in is optional — you can check out as a guest.</li>
          <li><strong>If you join our newsletter:</strong> your email only.</li>
          <li><strong>If you write a review:</strong> your name, city and review, shown on the site after we check it.</li>
          <li><strong>On your device:</strong> your cart, wishlist, recently viewed products and chosen language are saved in your own browser, not with us.</li>
        </ul>
      </section>

      <section>
        <h2>How we use it</h2>
        <ul>
          <li>To process and deliver your order and contact you about it on WhatsApp or by phone.</li>
          <li>To handle exchanges, returns and customer service.</li>
          <li>To email you offers and new arrivals — only if you subscribed to the newsletter.</li>
          <li>To improve our website and service.</li>
        </ul>
      </section>

      <section>
        <h2>Payment details</h2>
        <p>Card payments happen entirely on Paymob's secure payment page. We never see or store your card number or any of your banking details.</p>
      </section>

      <section>
        <h2>Who sees your information</h2>
        <ul>
          <li>The shipping company or courier: your name, phone and address, only as needed to deliver your order.</li>
          <li>The technical providers we rely on to run the website (hosting, database, payments and email).</li>
        </ul>
        <p><strong>We never sell your information or share it with anyone for marketing.</strong></p>
      </section>

      <section>
        <h2>Your rights</h2>
        <ul>
          <li>You can ask for a copy of your information, or ask us to correct or delete it.</li>
          <li>You can unsubscribe from the newsletter at any time.</li>
        </ul>
        <p>
          For any of these, message us on WhatsApp at
          <a :href="whatsappLink" target="_blank" rel="noopener noreferrer">{{ settings.whatsappSupport }}</a>.
          We may need to keep some details of past orders for a while for accounting reasons.
        </p>
      </section>

      <section>
        <h2>Changes to this policy</h2>
        <p>We may update this policy from time to time; the date of the latest update is shown at the top of this page.</p>
      </section>
    </template>
  </LegalPage>
</template>

<script setup>
const UPDATED = '2026-10-03'
const settings = useStoreSettings()
const { t, isAr } = useLang()
const whatsappLink = computed(() => `https://wa.me/${toWhatsAppNumber(settings.value.whatsappSupport)}`)

useSeoMeta({
  title: () => t('policies.privacy'),
  description: () => t('policies.privacyMeta'),
})
</script>
