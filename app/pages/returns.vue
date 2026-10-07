<template>
  <LegalPage :title="$t('policies.returns')" :updated="UPDATED">
    <template v-if="isAr">
      <section>
        <p>
          رضاك يهمنا. لو المنتج وصلك فيه مشكلة أو غيّرت رأيك، تقدر تستبدله أو ترجعه بالشروط اللي تحت.
          ابعتلنا على واتساب ونحلّها معاك بسرعة.
        </p>
      </section>

      <section>
        <h2>المدة</h2>
        <p>تقدر تطلب الاستبدال أو الاسترجاع خلال <strong>{{ RETURN_DAYS }} يوم</strong> من يوم استلام الطلب.</p>
      </section>

      <section>
        <h2>شروط قبول المنتج</h2>
        <ul>
          <li>يكون المنتج بحالته الأصلية، غير مستخدم، وفي علبته وتغليفه الأصلي.</li>
          <li>يكون معاه كل الملحقات والهدايا اللي وصلت معاه.</li>
          <li>نحتاج رقم الطلب (بيبدأ بـ SDW) عشان نراجع الطلب.</li>
        </ul>
      </section>

      <section>
        <h2>منتجات لا يمكن إرجاعها</h2>
        <p>حفاظًا على صحة وسلامة كل عملائنا، لا يمكن إرجاع أو استبدال:</p>
        <ul>
          <li>منتجات المكياج والعناية بالبشرة والشعر والعطور بعد فتحها أو استخدامها أو فك الغلاف البلاستيك.</li>
          <li>الإكسسوارات الشخصية اللي بتتلبس مباشرة على الجسم زي الحلقان، بعد استخدامها.</li>
        </ul>
        <p>إلا لو المنتج وصلك تالف أو فيه عيب صناعة أو مختلف عن اللي طلبته، وقتها بنستبدله أو نرجعلك فلوسه في كل الأحوال.</p>
      </section>

      <section>
        <h2>منتج تالف أو غلط</h2>
        <p>
          لو وصلك منتج مكسور أو فيه عيب أو مختلف عن طلبك، ابعتلنا صورته على واتساب خلال
          <strong>{{ DAMAGE_REPORT_HOURS }} ساعة</strong> من الاستلام. في الحالة دي إحنا اللي بنتحمل مصاريف الشحن بالكامل.
        </p>
      </section>

      <section>
        <h2>مصاريف الشحن</h2>
        <ul>
          <li>لو المنتج تالف أو غلط: الشحن علينا.</li>
          <li>لو غيّرت رأيك: مصاريف شحن الإرجاع على العميل، ومصاريف الشحن الأصلية لا تُرد.</li>
        </ul>
      </section>

      <section>
        <h2>استرداد المبلغ</h2>
        <p>بعد ما المنتج يوصلنا ونفحصه، بنرجع المبلغ خلال <strong>{{ REFUND_DAYS }} أيام عمل</strong>:</p>
        <ul>
          <li>لو دفعت بالكارت: المبلغ بيرجع على نفس الكارت، وممكن البنك ياخد وقت إضافي لحد ما يظهر.</li>
          <li>لو دفعت كاش عند الاستلام أو تحويل: بنرجعلك المبلغ على فودافون كاش أو تحويل بنكي حسب اختيارك.</li>
        </ul>
        <p>وتقدر بدل الاسترداد تختار تستبدل بمنتج تاني، ولو فيه فرق في السعر بندفعه أو بنرجعه حسب الحالة.</p>
      </section>

      <section>
        <h2>إزاي تطلب الاستبدال أو الاسترجاع</h2>
        <ul>
          <li>
            ابعتلنا على واتساب على
            <a :href="whatsappLink" target="_blank" rel="noopener noreferrer" dir="ltr">{{ settings.whatsappSupport }}</a>
            رقم الطلب وسبب الاستبدال أو الاسترجاع، ومعاهم صور لو المنتج فيه مشكلة.
          </li>
          <li>هنأكد معاك الطلب ونرتب ميعاد استلام المنتج.</li>
          <li>بعد استلامه وفحصه، بنبعتلك المنتج البديل أو نرجعلك المبلغ.</li>
        </ul>
      </section>
    </template>

    <template v-else>
      <section>
        <p>
          Your satisfaction matters to us. If something's wrong with your order or you've changed your mind,
          you can exchange or return it under the conditions below. Message us on WhatsApp and we'll sort it out quickly.
        </p>
      </section>

      <section>
        <h2>Time frame</h2>
        <p>You can request an exchange or return within <strong>{{ RETURN_DAYS }} days</strong> of receiving your order.</p>
      </section>

      <section>
        <h2>Conditions</h2>
        <ul>
          <li>The item is in its original condition, unused, and in its original box and packaging.</li>
          <li>It comes with all accessories and gifts that were delivered with it.</li>
          <li>We'll need your order number (it starts with SDW) to look up the order.</li>
        </ul>
      </section>

      <section>
        <h2>Items that can't be returned</h2>
        <p>To protect the health and safety of all our customers, we can't accept returns or exchanges of:</p>
        <ul>
          <li>Makeup, skincare, haircare and perfume products once opened, used, or unsealed.</li>
          <li>Personal accessories worn directly on the body, such as earrings, once used.</li>
        </ul>
        <p>The only exception is if the item arrived damaged, defective, or different from what you ordered — then we'll always exchange it or refund you.</p>
      </section>

      <section>
        <h2>Damaged or wrong items</h2>
        <p>
          If an item arrives broken, defective, or different from your order, send us a photo on WhatsApp within
          <strong>{{ DAMAGE_REPORT_HOURS }} hours</strong> of delivery. In that case we cover all shipping costs.
        </p>
      </section>

      <section>
        <h2>Shipping costs</h2>
        <ul>
          <li>Damaged or wrong item: shipping is on us.</li>
          <li>Changed your mind: return shipping is paid by the customer, and the original shipping fee isn't refunded.</li>
        </ul>
      </section>

      <section>
        <h2>Refunds</h2>
        <p>Once the item reaches us and we've checked it, we refund you within <strong>{{ REFUND_DAYS }} working days</strong>:</p>
        <ul>
          <li>Paid by card: the amount goes back to the same card. Your bank may take a few extra days to show it.</li>
          <li>Paid cash on delivery or by transfer: we refund you by Vodafone Cash or bank transfer, whichever you prefer.</li>
        </ul>
        <p>Instead of a refund you can choose to exchange for another product; any price difference is paid or refunded accordingly.</p>
      </section>

      <section>
        <h2>How to request an exchange or return</h2>
        <ul>
          <li>
            Message us on WhatsApp at
            <a :href="whatsappLink" target="_blank" rel="noopener noreferrer">{{ settings.whatsappSupport }}</a>
            with your order number and the reason, plus photos if the item has a problem.
          </li>
          <li>We'll confirm the request and arrange a time to collect the item.</li>
          <li>After we receive and check it, we'll send the replacement or refund you.</li>
        </ul>
      </section>
    </template>
  </LegalPage>
</template>

<script setup>
// Review these with the store's actual policy before launch.
const RETURN_DAYS = 14
const DAMAGE_REPORT_HOURS = 48
const REFUND_DAYS = 7
const UPDATED = '2026-10-03'

const settings = useStoreSettings()
const { t, isAr } = useLang()
const whatsappLink = computed(() => `https://wa.me/${toWhatsAppNumber(settings.value.whatsappSupport)}`)

useSeoMeta({
  title: () => t('policies.returns'),
  description: () => t('policies.returnsMeta', { days: RETURN_DAYS }),
})
</script>
