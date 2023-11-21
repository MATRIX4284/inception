/*
 * Licensed to the Technische Universität Darmstadt under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The Technische Universität Darmstadt 
 * licenses this file to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.
 *  
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package de.tudarmstadt.ukp.inception.recommendation.api.model;

import static java.util.Arrays.asList;
import static java.util.Collections.emptyMap;
import static java.util.Collections.singletonMap;
import static java.util.Collections.sort;
import static java.util.Collections.unmodifiableList;
import static java.util.Collections.unmodifiableMap;
import static java.util.Comparator.comparing;
import static java.util.Comparator.comparingInt;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.toList;
import static org.apache.commons.collections4.IteratorUtils.unmodifiableIterator;

import java.io.Serializable;
import java.util.AbstractCollection;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.function.BiConsumer;
import java.util.function.BinaryOperator;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Collector;
import java.util.stream.Stream;

import org.apache.commons.lang3.Validate;
import org.apache.commons.lang3.builder.CompareToBuilder;
import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

/**
 * Group of alternative suggestions generated by one or more recommenders. The group maintains an
 * order of the alternative suggestions, by default using the score.
 * 
 * @param <T>
 *            the suggestion type
 */
public class SuggestionGroup<T extends AnnotationSuggestion>
    extends AbstractCollection<T>
    implements Serializable
{
    private static final long serialVersionUID = 8729617486073480240L;

    private final List<T> suggestions;
    private boolean sorted = true;
    private Position position;
    private String feature;
    private long layerId;
    private String documentName;

    public SuggestionGroup()
    {
        suggestions = new ArrayList<>();
    }

    @SafeVarargs
    public SuggestionGroup(T... aItems)
    {
        suggestions = new ArrayList<>(asList(aItems));
        sorted = suggestions.size() < 2;
        if (!suggestions.isEmpty()) {
            position = suggestions.get(0).getPosition();
            feature = get(0).getFeature();
            layerId = get(0).getLayerId();
            documentName = get(0).getDocumentName();
        }
    }

    public String getFeature()
    {
        return feature;
    }

    public long getLayerId()
    {
        return layerId;
    }

    public String getDocumentName()
    {
        return documentName;
    }

    public Position getPosition()
    {
        return position;
    }

    public T get(int aIndex)
    {
        return suggestions.get(aIndex);
    }

    private void ensureSortedState()
    {
        // To the outside, the group should appear to be sorted.
        if (!sorted) {
            sort(suggestions, comparing(AnnotationSuggestion::getScore).reversed());
            sorted = true;
        }
    }

    public List<AnnotationSuggestion> bestSuggestionsByFeatureAndLabel(Preferences aPreferences,
            String aFeature, String aLabel)
    {
        LabelMapKey key = new LabelMapKey(aFeature, aLabel);

        Map<LabelMapKey, Map<Long, T>> labelMap = suggestionsByLabel(aPreferences);

        Map<Long, T> perRecommender = labelMap.get(key);
        if (perRecommender == null) {
            return Collections.emptyList();
        }

        return perRecommender.values().stream() //
                .sorted(comparing(AnnotationSuggestion::getScore)
                        .thenComparing(AnnotationSuggestion::getRecommenderName)) //
                .collect(toList());
    }

    private Map<LabelMapKey, Map<Long, T>> suggestionsByLabel(Preferences aPreferences)
    {
        Map<LabelMapKey, Map<Long, T>> labelMap = new HashMap<>();

        // For recommendations with the same label by the same classifier,
        // show only the score of the highest one
        for (T ao : this) {
            // Skip rendering suggestions that should not be rendered
            if (!aPreferences.isShowAllPredictions()
                    && (!ao.isVisible() || (ao.getScore() < aPreferences.getScoreThreshold()))) {
                continue;
            }

            Map<Long, T> bestSuggestionByRecommender = labelMap.computeIfAbsent(new LabelMapKey(ao),
                    _label -> new HashMap<>());

            T currentBestSuggestion = bestSuggestionByRecommender.get(ao.getRecommenderId());

            if (currentBestSuggestion == null || currentBestSuggestion.getScore() < ao.getScore()) {
                bestSuggestionByRecommender.put(ao.getRecommenderId(), ao);
            }
        }

        return labelMap;
    }

    public List<T> bestSuggestions(Preferences aPreferences)
    {
        Map<LabelMapKey, Map<Long, T>> labelMap = suggestionsByLabel(aPreferences);

        // Determine the maximum score per Label
        Map<LabelMapKey, Double> maxScorePerLabel = new HashMap<>();
        for (LabelMapKey label : labelMap.keySet()) {
            double maxScore = 0;
            for (Entry<Long, T> classifier : labelMap.get(label).entrySet()) {
                if (classifier.getValue().getScore() > maxScore) {
                    maxScore = classifier.getValue().getScore();
                }
            }
            maxScorePerLabel.put(label, maxScore);
        }

        // Sort by score (e.getValue()) and limit labels according to max suggestions
        // Note: the order in which annotations are rendered is only indicative to the
        // frontend (e.g. brat) which may choose to re-order them (e.g. for layout reasons).
        List<LabelMapKey> sortedAndFiltered = maxScorePerLabel.entrySet().stream() //
                .sorted((e1, e2) -> Double.compare(e2.getValue(), e1.getValue())) //
                .limit(aPreferences.getMaxPredictions()) //
                .map(Entry::getKey) //
                .collect(toList());

        // Create VID using the recommendation with the lowest recommendationId
        List<T> canonicalSuggestions = new ArrayList<>();
        for (LabelMapKey label : sortedAndFiltered) {
            // Pick out the recommendations with the lowest recommendationId as canonical for
            // generating the VID
            T ao = stream()
                    // check for label or feature for no-label annotations as key
                    .filter(p -> label.equalsAnnotationSuggestion(p))
                    .max(comparingInt(AnnotationSuggestion::getId)) //
                    .orElse(null);

            if (ao != null) {
                canonicalSuggestions.add(ao);
            }
        }

        return canonicalSuggestions;
    }

    @Override
    public Stream<T> stream()
    {
        ensureSortedState();
        return suggestions.stream();
    }

    /**
     * @return the deltas of all candidates. The deltas are calculated separately for each
     *         recommender if the group contains recommendations from multiple recommenders. That is
     *         necessary because the scores of different recommenders are not necessarily on the
     *         same scale. Additionally, only suggestions that are {@link SpanSuggestion#isVisible()
     *         visible} are taken into consideration.
     */
    public Map<Long, List<Delta<T>>> getAllDeltas()
    {
        if (isEmpty()) {
            return emptyMap();
        }
        else if (size() == 1) {
            T top = get(0);
            return singletonMap(top.getRecommenderId(), asList(new Delta<T>(top)));
        }
        else {
            // Group the suggestions by recommender because the scores cannot be compared
            // across recommenders
            Map<Long, List<T>> suggestionsByRecommenders = stream()
                    .collect(groupingBy(AnnotationSuggestion::getRecommenderId));

            Map<Long, List<Delta<T>>> result = new HashMap<>();
            for (Entry<Long, List<T>> e : suggestionsByRecommenders.entrySet()) {
                long recommenderId = e.getKey();
                // We consider only candidates that are visible
                List<T> candidates = e.getValue().stream() //
                        .filter(AnnotationSuggestion::isVisible).collect(toList());
                List<Delta<T>> deltas = new ArrayList<>();

                Iterator<T> i = candidates.iterator();
                T first = i.next();
                while (i.hasNext()) {
                    T second = i.next();
                    deltas.add(new Delta<T>(first, second));
                    first = second;
                }
                deltas.add(new Delta<T>(first));

                result.put(recommenderId, unmodifiableList(deltas));
            }

            return unmodifiableMap(result);
        }
    }

    /**
     * @param aPreferences
     *            recommender user preferences
     * @return the top delta per recommender. The deltas are calculated separately for each
     *         recommender if the group contains recommendations from multiple recommenders. That is
     *         necessary because the scores of different recommenders are not necessarily on the
     *         same scale. Additionally, only suggestions that are {@link SpanSuggestion#isVisible()
     *         visible} are taken into consideration.
     */
    public Map<Long, Delta<T>> getTopDeltas(Preferences aPreferences)
    {
        if (isEmpty()) {
            return emptyMap();
        }
        else if (size() == 1) {
            T top = get(0);
            if (top.isVisible() && top.getScore() >= aPreferences.getScoreThreshold()) {
                return singletonMap(top.getRecommenderId(), new Delta<T>(top));
            }
            else {
                return emptyMap();
            }
        }
        else {
            // Group the suggestions by recommender because the scores cannot be compared
            // across recommenders - note that the grouped lists are still sorted as the
            // we ensure that all the access methods (iterator, stream, etc) only return sorted
            // data.
            Map<Long, List<T>> predictionsByRecommenders = stream()
                    .collect(groupingBy(AnnotationSuggestion::getRecommenderId));

            double scoreThreshold = aPreferences.getScoreThreshold();

            Map<Long, Delta<T>> result = new HashMap<>();
            for (Entry<Long, List<T>> e : predictionsByRecommenders.entrySet()) {
                long recommenderId = e.getKey();
                // We consider only candidates that are visible - note that the filtered list is
                // still sorted
                List<T> visibleSuggestions = e.getValue().stream()
                        .filter(s -> s.isVisible() && s.getScore() >= scoreThreshold)
                        .collect(toList());

                if (visibleSuggestions.isEmpty()) {
                    // If a recommender has no visible suggestions, we skip it - nothing to do here
                }
                else if (visibleSuggestions.size() == 1) {
                    // If there is only one visible suggestions, grab it to create the delta
                    result.put(recommenderId, new Delta<T>(visibleSuggestions.get(0)));
                }
                else {
                    // Exploiting the fact that the filtered suggestions are still sorted, we just
                    // grab the first and second one to construct the delta
                    result.put(recommenderId,
                            new Delta<T>(visibleSuggestions.get(0), visibleSuggestions.get(1)));
                }
            }

            return unmodifiableMap(result);
        }
    }

    @Override
    public boolean add(T aSuggestion)
    {
        boolean empty = isEmpty();

        // When we add the second element to the group, then it is probably no longer sorted
        if (!empty) {
            sorted = false;
        }

        // All suggestions in a group must come from the same document (because they must be
        // on the same position) and layer/feature
        if (!empty) {
            T representative = get(0);
            Validate.isTrue(Objects.equals(representative.getPosition(), aSuggestion.getPosition()),
                    "All suggestions in a group must be at the same position: expected [%s] but got [%s]",
                    representative.getPosition(), aSuggestion.getPosition());
            Validate.isTrue(representative.getDocumentName().equals(aSuggestion.getDocumentName()),
                    "All suggestions in a group must come from the same document: expected [%s] but got [%s]",
                    representative.getDocumentName(), aSuggestion.getDocumentName());
            Validate.isTrue(representative.getLayerId() == aSuggestion.getLayerId(),
                    "All suggestions in a group must be on the same layer: expected [%d] but got [%d]",
                    representative.getLayerId(), aSuggestion.getLayerId());
            Validate.isTrue(representative.getFeature().equals(aSuggestion.getFeature()),
                    "All suggestions in a group must be for the same feature: expected [%s] but got [%s]",
                    representative.getFeature(), aSuggestion.getFeature());
        }

        // Cache information that must be consistent in the group when the first item is added
        if (empty) {
            position = aSuggestion.getPosition();
            feature = aSuggestion.getFeature();
            layerId = aSuggestion.getLayerId();
            documentName = aSuggestion.getDocumentName();
        }

        return suggestions.add(aSuggestion);
    }

    public void showAll(int aFlags)
    {
        stream().forEach(span -> span.show(aFlags));
    }

    public void hideAll(int aFlags)
    {
        stream().forEach(span -> span.hide(aFlags));
    }

    @Override
    public Iterator<T> iterator()
    {
        ensureSortedState();
        // Avoid changes to the group via the iterator since that might interfere with our sorting
        return unmodifiableIterator(suggestions.iterator());
    }

    @Override
    public boolean isEmpty()
    {
        return suggestions.isEmpty();
    }

    @Override
    public int size()
    {
        return suggestions.size();
    }

    public static <T extends AnnotationSuggestion> SuggestionGroupCollector<T> collector()
    {
        return new SuggestionGroupCollector<T>();
    }

    public static <T extends AnnotationSuggestion> Collection<SuggestionGroup<T>> group(
            Collection<T> aSuggestions)
    {
        SortedMap<GroupKey, SuggestionGroup<T>> grouped = aSuggestions.stream()
                .collect(groupingBy(GroupKey::new, TreeMap::new, SuggestionGroup.<T> collector()));
        return grouped.values();
    }

    public static class GroupKey
        implements Comparable<GroupKey>
    {
        private final Position position;
        private final String feature;
        private final long layerId;

        public GroupKey(AnnotationSuggestion aSuggestion)
        {
            super();
            position = aSuggestion.getPosition();
            feature = aSuggestion.getFeature();
            layerId = aSuggestion.getLayerId();
        }

        @Override
        public boolean equals(final Object other)
        {
            if (!(other instanceof GroupKey)) {
                return false;
            }
            GroupKey castOther = (GroupKey) other;
            return new EqualsBuilder() //
                    .append(position, castOther.position) //
                    .append(feature, castOther.feature) //
                    .append(layerId, castOther.layerId) //
                    .isEquals();
        }

        @Override
        public int hashCode()
        {
            return new HashCodeBuilder() //
                    .append(position) //
                    .append(position)//
                    .append(feature) //
                    .append(layerId).toHashCode();
        }

        @Override
        public int compareTo(final GroupKey other)
        {
            return new CompareToBuilder() //
                    .append(layerId, other.layerId) //
                    .append(feature, other.feature) //
                    .append(position, other.position) //
                    .toComparison();
        }
    }

    public static class Delta<T extends AnnotationSuggestion>
        implements Serializable
    {
        private static final long serialVersionUID = -4892325166786170047L;

        private final double delta;
        private final T first;
        private final T second;

        public Delta(T aFirst)
        {
            this(aFirst, null);
        }

        public Delta(T aFirst, T aSecond)
        {
            Validate.notNull(aFirst, "At least first item must be given to compute delta");

            first = aFirst;
            second = aSecond;

            if (second == null) {
                delta = Math.abs(aFirst.getScore());
            }
            else {
                delta = Math.abs(first.getScore() - second.getScore());
            }
        }

        public T getFirst()
        {
            return first;
        }

        public Optional<T> getSecond()
        {
            return Optional.ofNullable(second);
        }

        public double getDelta()
        {
            return delta;
        }
    }

    public static class SuggestionGroupCollector<T extends AnnotationSuggestion>
        implements Collector<T, SuggestionGroup<T>, SuggestionGroup<T>>
    {

        @Override
        public Supplier<SuggestionGroup<T>> supplier()
        {
            return SuggestionGroup::new;
        }

        @Override
        public BiConsumer<SuggestionGroup<T>, T> accumulator()
        {
            return SuggestionGroup::add;
        }

        @Override
        public BinaryOperator<SuggestionGroup<T>> combiner()
        {
            return (group1, group2) -> {
                group2.forEach(suggestion -> group1.add(suggestion));
                return group1;
            };
        }

        @Override
        public Function<SuggestionGroup<T>, SuggestionGroup<T>> finisher()
        {
            return Function.identity();
        }

        @Override
        public Set<Characteristics> characteristics()
        {
            return Collections.emptySet();
        }
    }

    /**
     * A Key identifying an AnnotationSuggestion by its label or as a suggestion without label.
     */
    private static class LabelMapKey
    {

        private String label;

        private boolean hasNoLabel;

        public LabelMapKey(AnnotationSuggestion aSuggestion)
        {
            if (aSuggestion.getLabel() == null) {
                hasNoLabel = true;
                label = aSuggestion.getFeature();
            }
            else {
                label = aSuggestion.getLabel();
            }
        }

        public LabelMapKey(String aFeature, String aLabel)
        {
            if (aLabel == null) {
                hasNoLabel = true;
                label = aFeature;
            }
            else {
                label = aLabel;
            }
        }

        @Override
        public boolean equals(Object aObj)
        {
            if (aObj == null || getClass() != aObj.getClass()) {
                return false;
            }

            LabelMapKey aKey = (LabelMapKey) aObj;
            return label.equals(aKey.getLabel()) && hasNoLabel == aKey.hasNoLabel();
        }

        @Override
        public int hashCode()
        {
            return Objects.hash(label, hasNoLabel);
        }

        public String getLabel()
        {
            return label;
        }

        public boolean hasNoLabel()
        {
            return hasNoLabel;
        }

        public boolean equalsAnnotationSuggestion(AnnotationSuggestion aSuggestion)
        {
            // annotation is label-less
            if (aSuggestion.getLabel() == null) {
                return hasNoLabel && label.equals(aSuggestion.getFeature());
            }
            else {
                return !hasNoLabel && label.equals(aSuggestion.getLabel());
            }
        }
    }

}
